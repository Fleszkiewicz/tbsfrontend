import { describe, it, expect, vi, beforeEach } from "vitest";
import type { PasajeroForm } from "../src/types/types";

// La búsqueda por DNI pega a la API: se simula
vi.mock("../src/services/pasajeros.services", () => ({
  buscarPasajerosPorDni: vi.fn(),
}));

import { buscarPasajerosPorDni } from "../src/services/pasajeros.services";
import {
  normalizeDni,
  venceAntesDe,
  fromApi,
  toPayload,
  getPasajerosError,
  findDniConflict,
  emptyPasajero,
} from "../src/utils/pasajeros";

const pax = (over: Partial<PasajeroForm> = {}): PasajeroForm => ({
  ...emptyPasajero(false),
  apellido: "Pérez",
  nombre: "Juan",
  ...over,
});

describe("normalizeDni", () => {
  it("quita puntos y espacios", () => {
    expect(normalizeDni("30.123 456")).toBe("30123456");
  });
});

describe("venceAntesDe (badge Renovar DNI/pasaporte)", () => {
  it("vence antes de la fecha de fin -> true", () => {
    expect(venceAntesDe("2026-11-10", "2026-11-20")).toBe(true);
  });
  it("vence el mismo día o después -> false", () => {
    expect(venceAntesDe("2026-11-20", "2026-11-20")).toBe(false);
    expect(venceAntesDe("2027-01-01", "2026-11-20")).toBe(false);
  });
  it("sin vencimiento o sin fecha de fin -> false", () => {
    expect(venceAntesDe("", "2026-11-20")).toBe(false);
    expect(venceAntesDe("2026-11-10", "")).toBe(false);
  });
});

describe("fromApi / toPayload", () => {
  it("pone al titular primero y recorta las fechas ISO", () => {
    const list = fromApi([
      { pasajero_id: 2, es_titular: false, apellido: "B", nombre: "b", dni: "2", vencimiento_dni: "2030-01-01T03:00:00.000Z" } as never,
      { pasajero_id: 1, es_titular: true, apellido: "A", nombre: "a", dni: "1" } as never,
    ]);
    expect(list[0].pasajero_id).toBe(1);
    expect(list[1].vencimiento_dni).toBe("2030-01-01");
  });

  it("convierte vacíos en null y normaliza el DNI", () => {
    const [p] = toPayload([pax({ es_titular: true, dni: "30.123.456", email: "  ", nombre: " Juan " })]);
    expect(p.dni).toBe("30123456");
    expect(p.email).toBeNull();
    expect(p.nombre).toBe("Juan");
    expect(p.vencimiento_dni).toBeNull();
  });
});

describe("getPasajerosError", () => {
  it("exige titular", () => {
    expect(getPasajerosError([pax()], true)).toBe("Falta el titular del expediente");
  });
  it("en alta exige nombre del titular; en edición no", () => {
    const list = [pax({ es_titular: true, nombre: "" })];
    expect(getPasajerosError(list, true)).toMatch(/nombre y el apellido del titular/);
    expect(getPasajerosError(list, false)).toBeNull();
  });
  it("todos necesitan apellido", () => {
    expect(getPasajerosError([pax({ es_titular: true }), pax({ apellido: " " })], false)).toMatch(/apellido/);
  });
  it("detecta DNI repetido aunque tenga puntos", () => {
    const list = [pax({ es_titular: true, dni: "30.123.456" }), pax({ dni: "30123456" })];
    expect(getPasajerosError(list, false)).toMatch(/repetido/);
  });
  it("lista válida -> null", () => {
    expect(getPasajerosError([pax({ es_titular: true, dni: "1234" }), pax({ dni: "5678" })], true)).toBeNull();
  });
});

describe("findDniConflict", () => {
  const buscar = vi.mocked(buscarPasajerosPorDni);
  beforeEach(() => buscar.mockReset());

  it("avisa si el DNI es de otra persona y no se eligió de la lista", async () => {
    buscar.mockResolvedValue([{ id: 99, dni: "30123456", nombre: "Ana", apellido: "Gómez" }] as never);
    const msg = await findDniConflict([pax({ dni: "30.123.456", pasajero_id: null })]);
    expect(msg).toMatch(/ya pertenece a Ana Gómez/);
  });

  it("no avisa si el pasajero elegido es el mismo", async () => {
    buscar.mockResolvedValue([{ id: 99, dni: "30123456", nombre: "Ana", apellido: "Gómez" }] as never);
    expect(await findDniConflict([pax({ dni: "30123456", pasajero_id: 99 })])).toBeNull();
  });

  it("no consulta DNIs de menos de 3 caracteres", async () => {
    expect(await findDniConflict([pax({ dni: "12" })])).toBeNull();
    expect(buscar).not.toHaveBeenCalled();
  });
});
