import { describe, it, expect, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { fillMonths, fmtMoney, fmtPct, mesCorto, pct } from "../src/utils/dashboard";
import { categoriaCancelacionLabel, CATEGORIAS_CANCELACION } from "../src/utils/cancelacion";

// Datos con la forma real de GET /api/dashboard/:vista (tomados de la base dev)
const fixtures = {
  expedientes: {
    kpis: { total: 54, activos: 2, finalizados: 44, cancelados: 1 },
    estados: [
      { estado: "finalizado", cantidad: 44 },
      { estado: "pendiente", cantidad: 9 },
      { estado: "cancelado", cantidad: 1 },
    ],
    sucursales: [
      { sucursal_id: 1, sucursal: "Baradero", cantidad: 1, monto_ars: 1000000, monto_usd: 0 },
      { sucursal_id: null, sucursal: "Sin sucursal", cantidad: 51, monto_ars: 18173774, monto_usd: 261930 },
    ],
    evolucion: [{ mes_num: 1, cantidad: 6 }, { mes_num: 11, cantidad: 3 }],
    motivos: [{ categoria: "cambio_planes", cantidad: 1 }],
  },
  productos: {
    kpis: { pasajeros: 3 },
    destinos: [{ destino: "Bariloche", cantidad: 2 }],
    servicios: [{ servicio_tipo_id: 7, nombre: "tickets aereos", cantidad: 36 }],
    tipos: [{ tipo: "nacional", cantidad: 11 }, { tipo: "internacional", cantidad: 33 }],
    edades: [{ categoria_edad: "adulto", cantidad: 2 }, { categoria_edad: "menor", cantidad: 1 }],
  },
  finanzas: {
    kpis: {
      facturacion_ars: 20173774, costo_ars: 16624784, ganancia_ars: 3548990,
      facturacion_usd: 220904, costo_usd: 201541, ganancia_usd: 19363,
    },
    mensual: [{ mes_num: 1, ingreso_ars: 3168700, costo_ars: 2721643, ingreso_usd: 25782, costo_usd: 23402 }],
    pagos: [{ pago: "contado_efectivo", cantidad: 1 }],
    monedas: [{ moneda_id: 1, moneda: "ars", cantidad: 10 }, { moneda_id: 3, moneda: "mixto", cantidad: 1 }],
    socios: [
      { socio: "pablo", abonado_ars: 600000, abonado_usd: 0, pendiente_ars: 0, pendiente_usd: 0 },
      { socio: "mariana", abonado_ars: 0, abonado_usd: 0, pendiente_ars: 600000, pendiente_usd: 0 },
    ],
  },
  expensas: {
    kpis: {
      total_ars: 5567551, total_usd: 2444, baradero_ars: 444, baradero_usd: 0,
      hurlingham_ars: 10664, hurlingham_usd: 2444, ganancia_ars: 3548990, ganancia_usd: 19363,
      balance_ars: -2018561, balance_usd: 16919,
    },
    mensual: [{ mes_num: 11, ars: 5567551, usd: 2444 }],
    sucursales: [{ sucursal_id: 2, sucursal: "Hurlingham", ars: 10664, usd: 2444 }],
  },
};

let mode: "data" | "empty" | "error" = "data";

vi.mock("../src/hooks/useDashboard", () => ({
  useDashboard: (vista: keyof typeof fixtures) =>
    mode === "error"
      ? { data: undefined, isLoading: false, isError: true }
      : { data: mode === "empty" ? vacio(vista) : fixtures[vista], isLoading: false, isError: false },
}));

// Misma forma pero sin filas (período sin datos)
const vacio = (vista: keyof typeof fixtures) => {
  const f = fixtures[vista] as Record<string, unknown>;
  const kpis = Object.fromEntries(Object.keys(f.kpis as object).map((k) => [k, 0]));
  return Object.fromEntries(Object.keys(f).map((k) => [k, k === "kpis" ? kpis : []]));
};

import { ExpedientesView } from "../src/components/common/dashboard/ExpedientesView";
import { ProductosView } from "../src/components/common/dashboard/ProductosView";
import { FinanzasView } from "../src/components/common/dashboard/FinanzasView";
import { ExpensasView } from "../src/components/common/dashboard/ExpensasView";

const vistas = [
  [
    "Expedientes",
    ExpedientesView,
    // Los 7 motivos aparecen aunque tengan 0
    ["Estados de expedientes", "Cantidad de expedientes creados por mes", "Cambio de fechas o planes", "Sin respuesta del cliente"],
  ],
  ["Destinos y Servicios", ProductosView, ["Top destinos", "Servicios más utilizados", "Nacional vs. Internacional", "3 pasajeros"]],
  ["Finanzas", FinanzasView, ["Ingresos, costos y ganancia", "Contado (efectivo)", "Distribución por moneda"]],
  ["Expensas", ExpensasView, ["Evolución mensual de gastos", "Comparativa por sucursal"]],
] as const;

// Lo que se quitó el 25/11/2026: tarjetas KPI, liquidación a socios y balance neto
const quitados = ["Total de expedientes", "Tasa de cancelación", "Destino más visitado", "Margen promedio", "Liquidación a socios", "Balance neto"];

describe("vistas del Dashboard", () => {
  it.each(vistas)("%s se dibuja con datos", (_, View, textos) => {
    mode = "data";
    const html = renderToString(<View />);
    for (const t of textos) expect(html).toContain(t);
    for (const t of quitados) expect(html).not.toContain(t);
  });

  it.each(vistas)("%s se dibuja sin datos", (_, View) => {
    mode = "empty";
    expect(() => renderToString(<View />)).not.toThrow();
  });

  it.each(vistas)("%s muestra el error si la API falla", (_, View) => {
    mode = "error";
    expect(renderToString(<View />)).toContain("No se pudieron cargar los datos");
  });
});

describe("helpers del Dashboard", () => {
  it("fillMonths completa los 12 meses", () => {
    const meses = fillMonths([{ mes_num: 3, cantidad: 5 }], { cantidad: 0 });
    expect(meses).toHaveLength(12);
    expect(meses[2]).toMatchObject({ mes_num: 3, cantidad: 5 });
    expect(meses[0]).toMatchObject({ mes_num: 1, cantidad: 0, mes: mesCorto(1) });
  });

  it("formatos en es-AR, sin mezclar monedas", () => {
    expect(fmtMoney(1234567.4, "ARS")).toBe("$ 1.234.567");
    expect(fmtMoney(2500, "USD")).toBe("USD 2.500");
    expect(fmtPct(pct(1, 3))).toBe("33,3 %");
    expect(pct(5, 0)).toBe(0);
  });

  it("categorías de cancelación: 7 fijas con sus textos", () => {
    expect(CATEGORIAS_CANCELACION).toHaveLength(7);
    expect(categoriaCancelacionLabel("otra_agencia")).toBe("Eligió otra agencia");
    expect(categoriaCancelacionLabel("Texto viejo")).toBeNull();
  });
});
