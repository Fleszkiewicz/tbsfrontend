// Respuestas de GET /api/dashboard/:vista (los importes ya llegan como number)

export type DashboardVista = "expedientes" | "productos" | "finanzas" | "expensas";

export type DashboardSucursal = "baradero" | "hurlingham";

export interface DashboardExpedientes {
  kpis: { total: number; activos: number; finalizados: number; cancelados: number };
  estados: { estado: string; cantidad: number }[];
  sucursales: {
    sucursal_id: number | null;
    sucursal: string;
    cantidad: number;
    monto_ars: number;
    monto_usd: number;
  }[];
  evolucion: { mes_num: number; cantidad: number }[];
  motivos: { categoria: string; cantidad: number }[];
}

export interface DashboardProductos {
  kpis: { pasajeros: number };
  destinos: { destino: string; cantidad: number }[];
  servicios: { servicio_tipo_id: number; nombre: string; cantidad: number }[];
  tipos: { tipo: "nacional" | "internacional"; cantidad: number }[];
  edades: { categoria_edad: "infante" | "menor" | "adulto" | "mayor"; cantidad: number }[];
}

export interface DashboardFinanzas {
  kpis: {
    facturacion_ars: number;
    costo_ars: number;
    ganancia_ars: number;
    facturacion_usd: number;
    costo_usd: number;
    ganancia_usd: number;
  };
  mensual: {
    mes_num: number;
    ingreso_ars: number;
    costo_ars: number;
    ingreso_usd: number;
    costo_usd: number;
  }[];
  pagos: { pago: string; cantidad: number }[];
  monedas: { moneda_id: number; moneda: string; cantidad: number }[];
  socios: {
    socio: string;
    abonado_ars: number;
    abonado_usd: number;
    pendiente_ars: number;
    pendiente_usd: number;
  }[];
}

export interface DashboardExpensas {
  kpis: {
    total_ars: number;
    total_usd: number;
    baradero_ars: number;
    baradero_usd: number;
    hurlingham_ars: number;
    hurlingham_usd: number;
    ganancia_ars: number;
    ganancia_usd: number;
    balance_ars: number;
    balance_usd: number;
  };
  mensual: { mes_num: number; ars: number; usd: number }[];
  sucursales: { sucursal_id: number | null; sucursal: string; ars: number; usd: number }[];
}

export interface DashboardDataMap {
  expedientes: DashboardExpedientes;
  productos: DashboardProductos;
  finanzas: DashboardFinanzas;
  expensas: DashboardExpensas;
}
