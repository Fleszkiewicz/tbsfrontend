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
import {
  ChartCard,
  ChartTooltip,
  CurrencyToggle,
  DonutChart,
  KpiCard,
  MoneyPair,
  ViewError,
  ViewSkeleton,
} from "./DashboardUI";
import {
  AXIS_TICK,
  C,
  capitalize,
  fillMonths,
  fmtCompact,
  fmtMoney,
  fmtNum,
  fmtPct,
  mesLargo,
  pct,
  type Moneda,
} from "../../../utils/dashboard";

const PAGOS: Record<string, { label: string; color: string }> = {
  contado_efectivo: { label: "Contado (efectivo)", color: C.ink },
  contado_transferencia: { label: "Contado (transferencia)", color: C.blue },
  cuotas: { label: "Cuotas", color: C.emerald },
  financiacion: { label: "Financiación", color: C.amber },
};

const MONEDAS: Record<number, { label: string; color: string }> = {
  1: { label: "ARS", color: C.ink },
  2: { label: "USD", color: C.emerald },
  3: { label: "Mixto", color: C.amber },
};

const legendFormatter = (value: string) => <span className="text-[12px] text-gray-600">{value}</span>;

export function FinanzasView() {
  const { data, isLoading, isError } = useDashboard("finanzas");
  const [monedaMensual, setMonedaMensual] = useState<Moneda>("ARS");
  const [monedaSocios, setMonedaSocios] = useState<Moneda>("ARS");

  if (isLoading) return <ViewSkeleton />;
  if (isError || !data) return <ViewError />;

  const { kpis } = data;
  const margenArs = pct(kpis.ganancia_ars, kpis.facturacion_ars);
  const margenUsd = pct(kpis.ganancia_usd, kpis.facturacion_usd);

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
    color: PAGOS[p.pago]?.color ?? C.gray,
  }));

  const monedas = data.monedas.map((m) => ({
    label: MONEDAS[m.moneda_id]?.label ?? m.moneda.toUpperCase(),
    color: MONEDAS[m.moneda_id]?.color ?? C.gray,
    cantidad: m.cantidad,
  }));

  const socios = data.socios.map((s) => ({
    label: capitalize(s.socio),
    abonado: monedaSocios === "ARS" ? s.abonado_ars : s.abonado_usd,
    pendiente: monedaSocios === "ARS" ? s.pendiente_ars : s.pendiente_usd,
  }));
  const haySocios = socios.some((s) => s.abonado !== 0 || s.pendiente !== 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Facturación" value={<MoneyPair ars={kpis.facturacion_ars} usd={kpis.facturacion_usd} />} />
        <KpiCard label="Costos" value={<MoneyPair ars={kpis.costo_ars} usd={kpis.costo_usd} />} />
        <KpiCard
          label="Ganancia"
          value={<MoneyPair ars={kpis.ganancia_ars} usd={kpis.ganancia_usd} tone />}
          sub="Sin restar expensas"
        />
        <KpiCard
          label="Margen promedio"
          value={
            <div className="flex flex-col">
              <span>
                {fmtPct(margenArs)} <span className="text-[12px] font-semibold text-gray-400">ARS</span>
              </span>
              <span className="text-[14px] md:text-[16px] font-semibold text-gray-500">
                {fmtPct(margenUsd)} <span className="text-[12px] text-gray-400">USD</span>
              </span>
            </div>
          }
          sub="Ganancia sobre facturación"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Ingresos, costos y ganancia"
          subtitle="Mes a mes por fecha de reserva (siempre los 12 meses del año)"
          className="lg:col-span-2"
          height={280}
          action={<CurrencyToggle value={monedaMensual} onChange={setMonedaMensual} />}
          isEmpty={!hayMensual}
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={mensual} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="mes" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={fmtCompact} width={48} />
              <Tooltip
                cursor={{ fill: "#F7F7F7" }}
                content={
                  <ChartTooltip
                    format={(v) => fmtMoney(v, monedaMensual)}
                    labelFormat={(_, payload) => mesLargo(Number(payload[0]?.payload?.mes_num))}
                  />
                }
              />
              <Legend iconType="circle" iconSize={8} formatter={legendFormatter} />
              <Bar dataKey="ingreso" name="Ingresos" fill={C.ink} radius={[4, 4, 0, 0]} maxBarSize={22} />
              <Bar dataKey="costo" name="Costos" fill={C.grayLight} radius={[4, 4, 0, 0]} maxBarSize={22} />
              <Line
                type="monotone"
                dataKey="ganancia"
                name="Ganancia"
                stroke={C.emerald}
                strokeWidth={2.5}
                dot={{ r: 3, fill: C.emerald, strokeWidth: 0 }}
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

        <ChartCard
          title="Liquidación a socios"
          subtitle="Abonado vs. pendiente (un tercio de la ganancia de cada expediente) · no incluye legajos antiguos"
          className="lg:col-span-2"
          height={200}
          action={<CurrencyToggle value={monedaSocios} onChange={setMonedaSocios} />}
          isEmpty={!haySocios}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={socios} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={fmtCompact} />
              <YAxis
                type="category"
                dataKey="label"
                width={80}
                tick={{ ...AXIS_TICK, fill: "#4B5563" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: "#F7F7F7" }} content={<ChartTooltip format={(v) => fmtMoney(v, monedaSocios)} />} />
              <Legend iconType="circle" iconSize={8} formatter={legendFormatter} />
              <Bar dataKey="abonado" name="Abonado" stackId="socio" fill={C.emerald} barSize={18} />
              <Bar dataKey="pendiente" name="Pendiente" stackId="socio" fill={C.amber} radius={[0, 6, 6, 0]} barSize={18} />
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
