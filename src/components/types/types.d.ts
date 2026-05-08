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
  id: string;
  estado: string;
  fecha: string;
  fecha_ida: string;
  fecha_vuelta: string;
  moneda: string;
  destino: "nacional" | "internacional";
  apellido: string;
  valor_total: number;
  valor_total_usd: number;
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
  apellido: string;
  valor_total: number;
  valor_total_usd?: number;
  cotizacion?: number | null;
  destino: "internacional" | "nacional" | "";
  fecha: string;
  fecha_ida: string;
  fecha_vuelta: string;
  moneda: number;
};

export type UpdateTripRequest = {
  valor_total?: number;
  destino?: "internacional" | "nacional";
  apellido?: string;
  moneda?: number;
  fecha_ida?: string;
  fecha_vuelta?: string;
  fecha?: string;
  accuracy?: string;
  fecha?: string;
  cotizacion?: number | null;
  valor_total_usd?: number;
  servicios: UpdateServiceData[];
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
