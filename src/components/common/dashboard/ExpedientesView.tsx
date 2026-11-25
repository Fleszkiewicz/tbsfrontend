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
import { categoriaCancelacionLabel } from "../../../utils/cancelacion";
import {
  ChartCard,
  ChartTooltip,
  DonutChart,
  HorizontalBars,
  KpiCard,
  ViewError,
  ViewSkeleton,
} from "./DashboardUI";
import {
  AXIS_TICK,
  C,
  capitalize,
  fillMonths,
  fmtMoney,
  fmtNum,
  fmtPct,
  mesLargo,
  pct,
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

  const { kpis } = data;
  const tasaCancelacion = pct(kpis.cancelados, kpis.total);

  const estados = ESTADOS.map((e) => ({
    name: capitalize(e.key),
    value: data.estados.find((r) => r.estado === e.key)?.cantidad ?? 0,
    color: e.color,
  })).filter((e) => e.value > 0);

  const evolucion = fillMonths(data.evolucion, { cantidad: 0 });

  const motivos = data.motivos.map((m) => ({
    label: categoriaCancelacionLabel(m.categoria) ?? m.categoria,
    value: m.cantidad,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total de expedientes" value={fmtNum(kpis.total)} sub="Todos los estados" />
        <KpiCard label="Activos" value={fmtNum(kpis.activos)} sub="En espera y en curso" />
        <KpiCard label="Finalizados" value={fmtNum(kpis.finalizados)} tone="positive" />
        <KpiCard
          label="Tasa de cancelación"
          value={fmtPct(tasaCancelacion)}
          sub={`${fmtNum(kpis.cancelados)} cancelados`}
          tone={kpis.cancelados > 0 ? "negative" : "default"}
        />
      </div>

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
          subtitle="Expedientes por mes de reserva (siempre los 12 meses del año)"
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

        <ChartCard
          title="Motivos de cancelación"
          subtitle="No incluye legajos antiguos"
          className="lg:col-span-2"
          height={Math.max(160, motivos.length * 36)}
          isEmpty={motivos.length === 0}
          emptyText="No hay cancelaciones con motivo en este período"
        >
          <HorizontalBars data={motivos} color={C.red} name="Cancelaciones" labelWidth={180} />
        </ChartCard>
      </div>
    </div>
  );
}
