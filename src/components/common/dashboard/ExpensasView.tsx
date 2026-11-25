import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
  ViewError,
  ViewSkeleton,
} from "./DashboardUI";
import {
  AXIS_TICK,
  C,
  SUCURSAL_COLORS,
  fillMonths,
  fmtCompact,
  fmtMoney,
  mesLargo,
  type Moneda,
} from "../../../utils/dashboard";


export function ExpensasView() {
  const { data, isLoading, isError } = useDashboard("expensas");
  const [monedaMensual, setMonedaMensual] = useState<Moneda>("ARS");
  const [monedaSucursal, setMonedaSucursal] = useState<Moneda>("ARS");

  if (isLoading) return <ViewSkeleton />;
  if (isError || !data) return <ViewError />;

  const mensual = fillMonths(data.mensual, { ars: 0, usd: 0 }).map((m) => ({
    mes: m.mes,
    mes_num: m.mes_num,
    monto: monedaMensual === "ARS" ? m.ars : m.usd,
  }));
  const hayMensual = mensual.some((m) => m.monto !== 0);

  const sucursales = data.sucursales.map((s) => ({
    sucursal: s.sucursal,
    monto: monedaSucursal === "ARS" ? s.ars : s.usd,
  }));
  const haySucursales = sucursales.some((s) => s.monto !== 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Evolución mensual de gastos"
          subtitle="Siempre los 12 meses del año"
          className="lg:col-span-2"
          height={250}
          action={<CurrencyToggle value={monedaMensual} onChange={setMonedaMensual} />}
          isEmpty={!hayMensual}
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={mensual} margin={{ top: 10, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="mes" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={fmtCompact} width={48} />
              <Tooltip
                content={
                  <ChartTooltip
                    format={(v) => fmtMoney(v, monedaMensual)}
                    labelFormat={(_, payload) => mesLargo(Number(payload[0]?.payload?.mes_num))}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="monto"
                name="Expensas"
                stroke={C.red}
                strokeWidth={2.5}
                dot={{ r: 3, fill: C.red, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Comparativa por sucursal"
          className="lg:col-span-2"
          height={220}
          action={<CurrencyToggle value={monedaSucursal} onChange={setMonedaSucursal} />}
          isEmpty={!haySucursales}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sucursales} margin={{ top: 10, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="sucursal" tick={AXIS_TICK} axisLine={false} tickLine={false} />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} tickFormatter={fmtCompact} width={48} />
              <Tooltip cursor={{ fill: "#F7F7F7" }} content={<ChartTooltip format={(v) => fmtMoney(v, monedaSucursal)} />} />
              <Bar dataKey="monto" name="Expensas" radius={[8, 8, 0, 0]} maxBarSize={72}>
                {sucursales.map((s) => (
                  <Cell key={s.sucursal} fill={SUCURSAL_COLORS[s.sucursal] ?? C.grayLight} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}
