import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useDashboard } from "../../../hooks/useDashboard";
import {
  ChartCard,
  ChartTooltip,
  DonutChart,
  HorizontalBars,
  ViewError,
  ViewSkeleton,
} from "./DashboardUI";
import { AXIS_TICK, C, capitalize, fmtNum, fmtPct, pct } from "../../../utils/dashboard";

const EDADES = [
  { key: "infante", label: "Infantes", color: C.amber },
  { key: "menor", label: "Menores", color: C.blue },
  { key: "adulto", label: "Adultos", color: C.ink },
  { key: "mayor", label: "Mayores", color: C.gray },
] as const;

export function ProductosView() {
  const { data, isLoading, isError } = useDashboard("productos");

  if (isLoading) return <ViewSkeleton />;
  if (isError || !data) return <ViewError />;

  const nacional = data.tipos.find((t) => t.tipo === "nacional")?.cantidad ?? 0;
  const internacional = data.tipos.find((t) => t.tipo === "internacional")?.cantidad ?? 0;

  const destinos = data.destinos.map((d) => ({ label: d.destino, value: d.cantidad }));
  const servicios = data.servicios.map((s) => ({ ...s, nombre: capitalize(s.nombre) }));

  const tipos = [
    { name: "Nacional", value: nacional, color: C.emerald },
    { name: "Internacional", value: internacional, color: C.ink },
  ].filter((t) => t.value > 0);

  const edades = EDADES.map((e) => ({
    ...e,
    value: data.edades.find((r) => r.categoria_edad === e.key)?.cantidad ?? 0,
  }));
  const totalEdades = edades.reduce((acc, e) => acc + e.value, 0);
  const edadesRow = [Object.fromEntries([["name", "Pasajeros"], ...edades.map((e) => [e.key, e.value])])];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard
          title="Top destinos"
          subtitle='Los 10 más visitados (sin "Sin destino asignado")'
          height={Math.max(180, destinos.length * 32)}
          isEmpty={destinos.length === 0}
          emptyText="Todavía no hay destinos cargados en este período"
        >
          <HorizontalBars data={destinos} color={C.emerald} name="Visitas" />
        </ChartCard>

        <ChartCard title="Nacional vs. Internacional" isEmpty={tipos.length === 0}>
          <DonutChart data={tipos} centerLabel="expedientes" />
        </ChartCard>

        <ChartCard
          title="Servicios más utilizados"
          subtitle="Cantidad de servicios por tipo"
          className="lg:col-span-2"
          height={290}
          isEmpty={servicios.length === 0}
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={servicios} margin={{ top: 10, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis
                dataKey="nombre"
                tick={{ ...AXIS_TICK, fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-35}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip cursor={{ fill: "#F7F7F7" }} content={<ChartTooltip />} />
              <Bar dataKey="cantidad" name="Servicios" fill={C.blue} radius={[6, 6, 0, 0]} maxBarSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Composición de pasajeros"
          subtitle={`${fmtNum(totalEdades)} pasajeros por categoría de edad · no incluye legajos antiguos`}
          className="lg:col-span-2"
          height={120}
          isEmpty={totalEdades === 0}
        >
          <div className="flex flex-col h-full justify-center gap-3">
            <div className="h-[36px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={edadesRow} layout="vertical" stackOffset="expand" margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" hide />
                  <Tooltip
                    cursor={false}
                    content={<ChartTooltip format={(v) => `${fmtNum(v)} (${fmtPct(pct(v, totalEdades))})`} />}
                  />
                  {edades.map((e, i) => (
                    <Bar
                      key={e.key}
                      dataKey={e.key}
                      name={e.label}
                      stackId="edad"
                      fill={e.color}
                      radius={i === 0 ? [8, 0, 0, 8] : i === edades.length - 1 ? [0, 8, 8, 0] : 0}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-[12px]">
              {edades.map((e) => (
                <li key={e.key} className="flex items-center gap-1.5 text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: e.color }} />
                  {e.label}
                  <span className="font-semibold text-[#1D1D1F]">{fmtNum(e.value)}</span>
                  <span className="text-gray-400">· {fmtPct(pct(e.value, totalEdades))}</span>
                </li>
              ))}
            </ul>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
