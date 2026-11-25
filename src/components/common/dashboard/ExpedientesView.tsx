import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "../../../hooks/useDashboard";
import { CATEGORIAS_CANCELACION } from "../../../utils/cancelacion";
import { ChartCard, ChartTooltip, DonutChart, ViewError, ViewSkeleton } from "./DashboardUI";
import {
  AXIS_TICK,
  C,
  capitalize,
  fillMonths,
  fmtMoney,
  fmtNum,
  mesLargo,
} from "../../../utils/dashboard";

const ESTADOS = [
  { key: "pendiente", color: C.orange },
  { key: "en espera", color: C.yellow },
  { key: "en curso", color: C.blue },
  { key: "finalizado", color: C.emerald },
  { key: "cancelado", color: C.red },
];

const SUCURSAL_COLORS: Record<string, string> = { Baradero: C.ink, Hurlingham: C.blue };

export function ExpedientesView() {
  const { data, isLoading, isError } = useDashboard("expedientes");

  if (isLoading) return <ViewSkeleton />;
  if (isError || !data) return <ViewError />;

  const estados = ESTADOS.map((e) => ({
    name: capitalize(e.key),
    value: data.estados.find((r) => r.estado === e.key)?.cantidad ?? 0,
    color: e.color,
  })).filter((e) => e.value > 0);

  const evolucion = fillMonths(data.evolucion, { cantidad: 0 });

  // Las 7 categorías siempre, con 0 si no tienen registros, de mayor a menor
  const motivos = CATEGORIAS_CANCELACION.map((c) => ({
    label: c.label,
    value: data.motivos.find((m) => m.categoria === c.value)?.cantidad ?? 0,
  })).sort((a, b) => b.value - a.value);
  const maxMotivo = Math.max(...motivos.map((m) => m.value), 0);
  const totalMotivos = motivos.reduce((acc, m) => acc + m.value, 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Estados de expedientes" isEmpty={estados.length === 0}>
          <DonutChart data={estados} centerLabel="expedientes" />
        </ChartCard>

        <ChartCard
          title="Ventas por sucursal"
          subtitle="Cantidad de expedientes; los importes se ven al pasar el cursor"
          isEmpty={data.sucursales.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.sucursales} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="sucursal" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                cursor={{ fill: "#F7F7F7" }}
                content={
                  <ChartTooltip
                    extra={(payload) => {
                      const row = payload[0]?.payload as { monto_ars?: number; monto_usd?: number } | undefined;
                      if (!row) return null;
                      return (
                        <div className="mt-1.5 pt-1.5 border-t border-gray-100 text-gray-500 flex flex-col gap-0.5">
                          <span>{fmtMoney(row.monto_ars ?? 0, "ARS")}</span>
                          <span>{fmtMoney(row.monto_usd ?? 0, "USD")}</span>
                        </div>
                      );
                    }}
                  />
                }
              />
              <Bar dataKey="cantidad" name="Expedientes" radius={[8, 8, 0, 0]} maxBarSize={64}>
                {data.sucursales.map((s) => (
                  <Cell key={s.sucursal} fill={SUCURSAL_COLORS[s.sucursal] ?? C.grayLight} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Evolución mensual"
          subtitle="Cantidad de expedientes creados por mes (fecha de reserva)"
          className="lg:col-span-2"
          height={240}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={evolucion} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
              <defs>
                <linearGradient id="gradExpedientes" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={C.ink} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={C.ink} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="mes" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                content={
                  <ChartTooltip
                    labelFormat={(_, payload) => mesLargo(Number(payload[0]?.payload?.mes_num))}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="cantidad"
                name="Expedientes"
                stroke={C.ink}
                strokeWidth={2}
                fill="url(#gradExpedientes)"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="lg:col-span-2 border border-gray-200 rounded-2xl p-4 md:p-5 min-w-0">
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <h3 className="text-[14px] font-semibold text-[#1D1D1F]">Motivos de cancelación</h3>
            <span className="text-[11px] text-gray-400">
              {fmtNum(totalMotivos)} {totalMotivos === 1 ? "cancelación" : "cancelaciones"} · sin legajos antiguos
            </span>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
            {motivos.map((m) => (
              <li key={m.label} className="flex items-center gap-3 text-[12px]">
                <span className={`w-[160px] shrink-0 truncate ${m.value > 0 ? "text-gray-700" : "text-gray-400"}`}>
                  {m.label}
                </span>
                <span className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <span
                    className="block h-full rounded-full bg-red-400"
                    style={{ width: `${maxMotivo > 0 ? (m.value / maxMotivo) * 100 : 0}%` }}
                  />
                </span>
                <span className={`w-6 text-right font-semibold ${m.value > 0 ? "text-[#1D1D1F]" : "text-gray-300"}`}>
                  {fmtNum(m.value)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
