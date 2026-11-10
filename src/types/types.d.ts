import type { PasajeroApi, PasajeroPayload } from "./pasajeros";

interface Service {
  id: number;
  nombre: string;
  valor: number;
  pagado_por: "pendiente" | "pablo" | "soledad" | "mariana";
  moneda: string;
  cotizacion: number | null;
  observacion: string | null;
}

export interface Trip {
  pasajeros?: PasajeroApi[];
  id: string;
  estado: string;
  cancelado?: 0 | 1;
  motivo_cancelacion?: string | null;
  fecha_cancelacion?: string | null;
  es_legado?: 0 | 1;
  fecha: string;
  fecha_ida: string;
  fecha_vuelta: string;
  moneda: string;
  destino: "nacional" | "internacional";
  apellido: string;
  nombre?: string | null;
  pago?: string | null;
  valor_total: number;
  valor_total_usd: number;
  sucursal_id: number | null;
  ganancia: number;
  ganancia_usd: number;
  costo: number;
  costo_usd: number;
  cotizacion: number | null;
  servicios: Service[];
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  pagination?: Pagination;
  timestamp: string;
}

interface ApiSingleResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface TripFile {
  id: string;
  nombre: string;
  categoria: string;
  url: string; // Para la descarga
  fecha: string;
}


export type TripsApiResponse = ApiResponse<Trip>;
export type TripApiResponse = ApiSingleResponse<Trip>;
export type ServiceApiResponse = ApiResponse<Service>;
export type FinanceApiResponse = ApiResponse<Finance>;

export type GetAccessTokenResponse = {
  accessToken: string;
};

export type CreateTripResponse = {
  trip: string;
};

export type LogOutResponse = {
  message: string;
};

export type UpdateDeleteTripResponse = {
  message: string;
  trip: string;
};

export type CreateServiceTripData = {
  viaje_id: string;
  servicio_id: number;
  valor: number;
  pagado_por: "pendiente" | "pablo" | "soledad" | "mariana" | "mixto";
  observacion?: string | null;
  cotizacion?: number | null;
};
export type UpdateServiceData = {
  id: number;
  valor: number;
  pagado_por: "pendiente" | "pablo" | "soledad" | "mariana" | "mixto";
  moneda: number;
  observacion: string | null;
  cotizacion: number | null;
};

type FinanceResume = {
  moneda: "ars" | "usd";
  ingreso: number;
  egreso: number;
  ganancia: number;
};

export type Finance = {
  mes: string;
  mes_num: number;
  resumen: FinanceResume[];
};

export type FinanceData = Finance[];

export type CreateTripRequest = {
  servicios: {
    id: number;
    valor: number;
    pagado_por: "pendiente";
    moneda: number;
    cotizacion: number | null;
    observacion?: string | null;
  }[];
  pasajeros: PasajeroPayload[];
  valor_total: number;
  valor_total_usd?: number;
  pago?: string;
  sucursal_id: number;
  cotizacion?: number | null;
  destino: "internacional" | "nacional" | "";
  fecha: string;
  fecha_ida: string;
  fecha_vuelta: string;
  moneda: number;
};

export type UpdateTripRequest = {
  pasajeros?: PasajeroPayload[];
  pago?: string;
  destino?: "internacional" | "nacional";
  moneda?: number;
  fecha?: string;
  fecha_ida?: string;
  fecha_vuelta?: string;
  valor_total?: number;
  valor_total_usd?: number;
  cotizacion?: number | null;
  servicios?: UpdateServiceData[];
};

export type User = {
  auth: boolean | undefined;
  nombre: string | undefined;
  email: string | undefined;
  avatar: string | undefined;
};

export type DestinoServiceDetail = {
  id: number; // refers to the service definition ID
  valor: number;
  pagado_por: "pendiente" | "pablo" | "soledad" | "mariana" | "mixto";
  moneda: number;
  cotizacion: number | null;
  observacion: string | null;
};

export type DestinoEntry = {
  destino: string;
  fecha_ida: string;
  fecha_vuelta: string;
  servicios: DestinoServiceDetail[];
};

export interface Expense {
  id: number;
  motivo: string;
  fecha: string; // "YYYY-MM-DD"
  moneda: string; // "ars" | "usd" (viene de la tabla moneda)
  cotizacion: number | null;
  monto: number;
}

export type Branch = "baradero" | "hurlingham";

export type CreateExpenseRequest = {
  motivo: string;
  fecha: string;
  moneda: 1 | 2; // 1 = ARS, 2 = USD
  cotizacion: number | null;
  monto: number;
  sucursal: Branch | "ambas";
};

export type ExpensesApiResponse = ApiResponse<Expense>;

export type CategoriaEdad = "infante" | "menor" | "adulto" | "mayor";

export type PasajeroApi = {
  pasajero_id: number;
  es_titular: boolean;
  categoria_edad: CategoriaEdad | null;
  dni: string | null;
  nombre: string | null;
  apellido: string;
  email: string | null;
  telefono: string | null;
  pasaporte: string | null;
  vencimiento_dni: string | null;
  vencimiento_pasaporte: string | null;
};

export type PasajeroBusqueda = {
  id: number;
  dni: string;
  nombre: string | null;
  apellido: string;
  email: string | null;
  telefono: string | null;
  pasaporte: string | null;
  vencimiento_dni: string | null;
  vencimiento_pasaporte: string | null;
};

export type PasajeroForm = {
  key: string;
  pasajero_id: number | null;
  es_titular: boolean;
  dni: string;
  dni_original: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  pasaporte: string;
  vencimiento_dni: string;
  vencimiento_pasaporte: string;
  categoria_edad: CategoriaEdad | "";
};

export type PasajeroPayload = {
  pasajero_id: number | null;
  es_titular: boolean;
  dni: string | null;
  nombre: string | null;
  apellido: string;
  email: string | null;
  telefono: string | null;
  pasaporte: string | null;
  vencimiento_dni: string | null;
  vencimiento_pasaporte: string | null;
  categoria_edad: CategoriaEdad | null;
};