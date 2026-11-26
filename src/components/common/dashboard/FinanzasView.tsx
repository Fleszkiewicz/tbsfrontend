import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "../../../hooks/useDashboard";
import { ChartCard, ChartTooltip, CurrencyToggle, DonutChart, ViewError, ViewSkeleton } from "./DashboardUI";
import {
  AXIS_TICK,
  C,
  capitalize,
  fillMonths,
  fmtCompact,
  fmtMoney,
  fmtNum,
  mesLargo,
  type Moneda,
} from "../../../utils/dashboard";

const PAGOS: Record<string, { label: string; color: string }> = {
  contado_efectivo: { label: "Contado (efectivo)", color: C.emerald },
  contado_transferencia: { label: "Contado (transferencia)", color: C.blue },
  cuotas: { label: "Cuotas", color: C.violet },
  financiacion: { label: "Financiación", color: C.orange },
};

const MONEDAS: Record<number, { label: string; color: string }> = {
  1: { label: "ARS", color: C.blue },
  2: { label: "USD", color: C.emerald },
  3: { label: "Mixto", color: C.orange },
};

// Ingresos, costos y ganancia: gama de azules (ingresos un poco más claro, costos un poco más oscuro, ganancia el azul base)
const MENSUAL = { ingreso: "#60A5FA", costo: "#2563EB", ganancia: C.blue };

const legendFormatter = (value: string) => <span className="text-[12px] text-gray-500">{value}</span>;

export function FinanzasView() {
  const { data, isLoading, isError } = useDashboard("finanzas");
  const [monedaMensual, setMonedaMensual] = useState<Moneda>("ARS");

  if (isLoading) return <ViewSkeleton charts={[{ kind: "bars", wide: true, height: 280 }, { kind: "donut" }, { kind: "bars" }]} />;
  if (isError || !data) return <ViewError />;

  const sufijo = monedaMensual === "ARS" ? "ars" : "usd";
  const mensual = fillMonths(data.mensual, { ingreso_ars: 0, costo_ars: 0, ingreso_usd: 0, costo_usd: 0 }).map(
    (m) => ({
      mes: m.mes,
      mes_num: m.mes_num,
      ingreso: m[`ingreso_${sufijo}`],
      costo: m[`costo_${sufijo}`],
      ganancia: m[`ingreso_${sufijo}`] - m[`costo_${sufijo}`],
    }),
  );
  const hayMensual = mensual.some((m) => m.ingreso !== 0 || m.costo !== 0);

  const pagos = data.pagos.map((p) => ({
    name: PAGOS[p.pago]?.label ?? capitalize(p.pago),
    value: p.cantidad,
    color: PAGOS[p.pago]?.color ?? C.cyan,
  }));

  const monedas = data.monedas.map((m) => ({
    label: MONEDAS[m.moneda_id]?.label ?? m.moneda.toUpperCase(),
    color: MONEDAS[m.moneda_id]?.color ?? C.cyan,
    cantidad: m.cantidad,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Ingresos, costos y ganancia"
          subtitle="Mes a mes por fecha de reserva · ganancia sin restar expensas"
          className="lg:col-span-2"
          height={280}
          action={<CurrencyToggle value={monedaMensual} onChange={setMonedaMensual} />}
          isEmpty={!hayMensual}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mensual} margin={{ top: 10, right: 8, bottom: 0, left: 0 }} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="mes" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={fmtCompact} width={48} />
              <Tooltip
                cursor={{ fill: "#F8FAFC" }}
                content={
                  <ChartTooltip
                    format={(v) => fmtMoney(v, monedaMensual)}
                    labelFormat={(_, payload) => mesLargo(Number(payload[0]?.payload?.mes_num))}
                  />
                }
              />
              <Legend iconType="circle" iconSize={8} formatter={legendFormatter} />
              <Bar dataKey="ingreso" name="Ingresos" fill={MENSUAL.ingreso} fillOpacity={0.35} radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="costo" name="Costos" fill={MENSUAL.costo} fillOpacity={0.35} radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Line
                type="monotone"
                dataKey="ganancia"
                name="Ganancia"
                stroke={MENSUAL.ganancia}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Formas de pago"
          subtitle="No incluye legajos antiguos"
          isEmpty={pagos.length === 0}
        >
          <DonutChart data={pagos} centerLabel="expedientes" />
        </ChartCard>

        <ChartCard title="Distribución por moneda" subtitle="Expedientes según su moneda" isEmpty={monedas.length === 0}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monedas} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="label" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: "#F7F7F7" }} content={<ChartTooltip />} />
              <Bar dataKey="cantidad" name="Expedientes" radius={[8, 8, 0, 0]} maxBarSize={56}>
                {monedas.map((m) => (
                  <Cell key={m.label} fill={m.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <p className="text-[11px] text-gray-400">
        Solo cuentan los expedientes en espera, en curso o finalizados. Los importes en ARS y USD se muestran por
        separado ({fmtNum(data.monedas.reduce((a, m) => a + m.cantidad, 0))} expedientes en el período).
      </p>
    </div>
  );
}
