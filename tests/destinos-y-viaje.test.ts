import { describe, it, expect } from "vitest";
import type { DestinoEntry, DestinoServiceDetail } from "../src/types/types";
import {
  servicioCompleto,
  serviciosEstado,
  destinoEstado,
  getDestinoDateError,
  destinosFromApi,
  destinoToPayload,
  servicioToPayload,
} from "../src/utils/destinos";
import { hasMissingTripFields, getTripDateError } from "../src/utils/tripValidation";

const serv = (over: Partial<DestinoServiceDetail> = {}): DestinoServiceDetail => ({
  servicio_tipo_id: 1,
  valor: 1000,
  moneda_id: 1,
  cotizacion: null,
  pagado_por: "pablo",
  observacion: null,
  ...over,
});

const dest = (over: Partial<DestinoEntry> = {}): DestinoEntry => ({
  destino: "Bariloche",
  fecha_desde: "2026-12-01",
  fecha_hasta: "2026-12-05",
  servicios: [serv()],
  ...over,
});

describe("servicioCompleto", () => {
  it("servicio completo en ARS", () => expect(servicioCompleto(serv())).toBe(true));
  it("pagado_por pendiente -> incompleto", () => expect(servicioCompleto(serv({ pagado_por: "pendiente" }))).toBe(false));
  it("valor 0 -> incompleto", () => expect(servicioCompleto(serv({ valor: 0 }))).toBe(false));
  it("USD sin cotización -> incompleto; con cotización -> completo", () => {
    expect(servicioCompleto(serv({ moneda_id: 2, cotizacion: null }))).toBe(false);
    expect(servicioCompleto(serv({ moneda_id: 2, cotizacion: 1500 }))).toBe(true);
  });
});

describe("estado del destino", () => {
  it("sin servicios -> pendiente", () => expect(serviciosEstado([])).toBe("pendiente"));
  it("todos completos y fechas cargadas -> confirmado", () => expect(destinoEstado(dest())).toBe("confirmado"));
  it("falta una fecha -> pendiente", () => expect(destinoEstado(dest({ fecha_hasta: "" }))).toBe("pendiente"));
  it("un servicio incompleto -> pendiente", () =>
    expect(destinoEstado(dest({ servicios: [serv(), serv({ pagado_por: "pendiente" })] }))).toBe("pendiente"));
});

describe("getDestinoDateError", () => {
  const desde = "2026-12-01";
  const hasta = "2026-12-10";
  it("hasta anterior a desde", () =>
    expect(getDestinoDateError({ fecha_desde: "2026-12-05", fecha_hasta: "2026-12-02" }, desde, hasta)).toMatch(/no puede ser anterior/));
  it("fuera del rango del expediente", () =>
    expect(getDestinoDateError({ fecha_desde: "2026-11-30", fecha_hasta: "2026-12-02" }, desde, hasta)).toMatch(/dentro del expediente \(01\/12\/2026 al 10\/12\/2026\)/));
  it("dentro del rango (bordes incluidos) -> null", () =>
    expect(getDestinoDateError({ fecha_desde: desde, fecha_hasta: hasta }, desde, hasta)).toBeNull());
  it("sin fechas del viaje no valida el rango", () =>
    expect(getDestinoDateError({ fecha_desde: "2020-01-01", fecha_hasta: "2020-01-02" }, "", "")).toBeNull());
});

describe("conversión API <-> formulario", () => {
  it("destinosFromApi recorta fechas y convierte números en texto (DECIMAL de MySQL)", () => {
    const [d] = destinosFromApi([
      { destino_id: 7, destino: "Salta", fecha_desde: "2026-12-01T03:00:00.000Z", fecha_hasta: "2026-12-03", servicios: [{ ...serv(), valor: "2500.50" as never, moneda_id: "2" as never, cotizacion: "1450.00" as never }] },
    ]);
    expect(d.fecha_desde).toBe("2026-12-01");
    expect(d.servicios[0].valor).toBe(2500.5);
    expect(d.servicios[0].moneda_id).toBe(2);
    expect(d.servicios[0].cotizacion).toBe(1450);
  });

  it("servicioToPayload descarta la cotización en ARS y la observación vacía", () => {
    const p = servicioToPayload(serv({ cotizacion: 1500, observacion: "  " }));
    expect(p.cotizacion).toBeNull();
    expect(p.observacion).toBeNull();
  });

  it("destinoToPayload solo manda destino_id si existe y recorta el nombre", () => {
    expect(destinoToPayload(dest({ destino: "  Mendoza " }))).not.toHaveProperty("destino_id");
    expect(destinoToPayload(dest({ destino_id: 3 })).destino_id).toBe(3);
    expect(destinoToPayload(dest({ destino: "  Mendoza " })).destino).toBe("Mendoza");
  });
});

describe("validación del formulario del viaje", () => {
  const base = {
    fecha: "2026-11-24", fecha_ida: "2026-12-01", fecha_vuelta: "2026-12-10",
    destino: "nacional", sucursal_id: 1, pago: "cuotas", moneda: 1, valor_total: 100000,
  };
  it("completo en ARS -> no falta nada", () => expect(hasMissingTripFields(base, true)).toBe(false));
  it("en alta exige sucursal y pago; en edición no", () => {
    const sinSucursal = { ...base, sucursal_id: undefined, pago: "" };
    expect(hasMissingTripFields(sinSucursal, true)).toBe(true);
    expect(hasMissingTripFields(sinSucursal, false)).toBe(false);
  });
  it("USD exige valor en USD y cotización", () => {
    expect(hasMissingTripFields({ ...base, moneda: 2, valor_total_usd: 2000, cotizacion: null }, true)).toBe(true);
    expect(hasMissingTripFields({ ...base, moneda: 2, valor_total_usd: 2000, cotizacion: 1500 }, true)).toBe(false);
  });
  it("mixto exige ARS, USD y cotización", () =>
    expect(hasMissingTripFields({ ...base, moneda: 3, valor_total_usd: 2000, cotizacion: null }, true)).toBe(true));
  it("fin anterior al inicio", () => {
    expect(getTripDateError({ fecha_ida: "2026-12-10", fecha_vuelta: "2026-12-01" })).toMatch(/no puede ser anterior/);
    expect(getTripDateError({ fecha_ida: "2026-12-01", fecha_vuelta: "2026-12-01" })).toBeNull();
  });
});
