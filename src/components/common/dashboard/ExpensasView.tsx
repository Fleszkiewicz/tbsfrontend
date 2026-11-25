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
import { IoInformationCircleOutline } from "react-icons/io5";
import { useDashboard } from "../../../hooks/useDashboard";
import {
  ChartCard,
  ChartTooltip,
  CurrencyToggle,
  KpiCard,
  MoneyPair,
  ViewError,
  ViewSkeleton,
} from "./DashboardUI";
import {
  AXIS_TICK,
  C,
  fillMonths,
  fmtCompact,
  fmtMoney,
  mesLargo,
  type Moneda,
} from "../../../utils/dashboard";

const SUCURSAL_COLORS: Record<string, string> = { Baradero: C.ink, Hurlingham: C.blue };

export function ExpensasView() {
  const { data, isLoading, isError } = useDashboard("expensas");
  const [monedaMensual, setMonedaMensual] = useState<Moneda>("ARS");
  const [monedaSucursal, setMonedaSucursal] = useState<Moneda>("ARS");

  if (isLoading) return <ViewSkeleton />;
  if (isError || !data) return <ViewError />;

  const { kpis } = data;

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

  const balanceNegativo = kpis.balance_ars < 0 || kpis.balance_usd < 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Total de expensas" value={<MoneyPair ars={kpis.total_ars} usd={kpis.total_usd} />} />
        <KpiCard label="Gasto Baradero" value={<MoneyPair ars={kpis.baradero_ars} usd={kpis.baradero_usd} />} />
        <KpiCard label="Gasto Hurlingham" value={<MoneyPair ars={kpis.hurlingham_ars} usd={kpis.hurlingham_usd} />} />
        <KpiCard
          label="Balance neto"
          value={<MoneyPair ars={kpis.balance_ars} usd={kpis.balance_usd} tone />}
          sub="Ganancia de viajes − expensas"
          tone={balanceNegativo ? "default" : "positive"}
        />
      </div>

      <div className="flex items-start gap-2 bg-[#f5f5f5] rounded-2xl px-4 py-3 text-[12px] text-gray-500">
        <IoInformationCircleOutline size={16} className="shrink-0 mt-px text-gray-400" />
        <p>
          El balance neto resta las expensas a la ganancia de los expedientes en espera, en curso y finalizados
          (ganancia del período: {fmtMoney(kpis.ganancia_ars, "ARS")} y {fmtMoney(kpis.ganancia_usd, "USD")}). En la
          vista Finanzas la ganancia se muestra sin restar expensas.
        </p>
      </div>

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
