import type { ReactNode } from "react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  AXIS_TICK,
  C,
  fmtNum,
  fmtPct,
  pct,
  type Moneda,
} from "../../../utils/dashboard";

// ─── Tarjetas ────────────────────────────────────────────────────────────────
export function ChartCard({
  title,
  subtitle,
  action,
  children,
  className = "",
  height = 260,
  isEmpty = false,
  emptyText = "Sin datos para este período",
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  height?: number;
  isEmpty?: boolean;
  emptyText?: string;
}) {
  return (
    <div className={`border border-gray-200 rounded-2xl p-4 md:p-5 flex flex-col min-w-0 ${className}`}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold text-[#1D1D1F]">{title}</h3>
          {subtitle && <p className="text-[11px] text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {isEmpty ? (
        <div
          className="flex items-center justify-center text-[13px] text-gray-400 font-medium text-center px-4"
          style={{ height }}
        >
          {emptyText}
        </div>
      ) : (
        <div style={{ height }} className="w-full min-w-0">
          {children}
        </div>
      )}
    </div>
  );
}

export function CurrencyToggle({ value, onChange }: { value: Moneda; onChange: (m: Moneda) => void }) {
  return (
    <div className="flex bg-[#f0f0f0] rounded-full p-0.5 select-none">
      {(["ARS", "USD"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`px-3 py-1 rounded-full text-[12px] font-semibold transition-all ${
            value === m ? "bg-white text-[#1D1D1F] shadow-sm" : "text-gray-500 hover:text-black"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

// ─── Tooltip ─────────────────────────────────────────────────────────────────
type TooltipItem = {
  name?: string | number;
  value?: number | string | (number | string)[];
  color?: string;
  dataKey?: string | number | ((obj: unknown) => unknown);
  payload?: Record<string, unknown>;
};

export function ChartTooltip({
  active,
  payload,
  label,
  format = (v) => fmtNum(v),
  labelFormat,
  extra,
}: {
  active?: boolean;
  payload?: ReadonlyArray<TooltipItem>;
  label?: string | number;
  format?: (value: number, item: TooltipItem) => string;
  labelFormat?: (label: string | number | undefined, payload: ReadonlyArray<TooltipItem>) => ReactNode;
  extra?: (payload: ReadonlyArray<TooltipItem>) => ReactNode;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const title = labelFormat ? labelFormat(label, payload) : label;
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 px-3 py-2 text-[12px] min-w-[140px]">
      {title !== undefined && title !== "" && (
        <div className="font-semibold text-[#1D1D1F] mb-1">{title}</div>
      )}
      {payload.map((item, i) => (
        <div key={i} className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-1.5 text-gray-500">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: item.color }} />
            {item.name}
          </span>
          <span className="font-semibold text-[#1D1D1F]">{format(Number(item.value), item)}</span>
        </div>
      ))}
      {extra?.(payload)}
    </div>
  );
}

// ─── Dona con total al centro y leyenda ──────────────────────────────────────
export type Slice = { name: string; value: number; color: string };

export function DonutChart({
  data,
  centerLabel,
  format = fmtNum,
}: {
  data: Slice[];
  centerLabel: string;
  format?: (n: number) => string;
}) {
  const total = data.reduce((acc, d) => acc + d.value, 0);
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 h-full">
      <div className="relative w-full sm:w-1/2 h-[170px] sm:h-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="62%"
              outerRadius="92%"
              paddingAngle={data.length > 1 ? 2 : 0}
              stroke="none"
              isAnimationActive={false}
            >
              {data.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              content={
                <ChartTooltip format={(v) => `${format(v)} (${fmtPct(pct(v, total))})`} />
              }
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[20px] font-bold text-[#1D1D1F] leading-none">{format(total)}</span>
          <span className="text-[11px] text-gray-400 mt-1">{centerLabel}</span>
        </div>
      </div>
      <ul className="w-full sm:w-1/2 flex flex-col gap-2 text-[12px]">
        {data.map((d) => (
          <li key={d.name} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-gray-600 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: d.color }} />
              <span className="truncate">{d.name}</span>
            </span>
            <span className="font-semibold text-[#1D1D1F] whitespace-nowrap">
              {format(d.value)} <span className="text-gray-400 font-normal">· {fmtPct(pct(d.value, total))}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Ranking en barras horizontales ──────────────────────────────────────────
export function HorizontalBars({
  data,
  color = C.ink,
  name = "Cantidad",
  labelWidth = 130,
}: {
  data: { label: string; value: number }[];
  color?: string;
  name?: string;
  labelWidth?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 36, bottom: 0, left: 0 }}>
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={labelWidth}
          tick={{ ...AXIS_TICK, fill: "#4B5563" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip cursor={{ fill: "#F7F7F7" }} content={<ChartTooltip />} />
        <Bar dataKey="value" name={name} fill={color} radius={[0, 6, 6, 0]} barSize={16}>
          <LabelList dataKey="value" position="right" style={{ fontSize: 12, fill: C.ink, fontWeight: 600 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Estados de carga / error ────────────────────────────────────────────────
export function ViewSkeleton() {
  return (
    <div className="flex flex-col gap-4 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="h-[320px] bg-gray-100 rounded-2xl" />
        <div className="h-[320px] bg-gray-100 rounded-2xl" />
      </div>
    </div>
  );
}

export function ViewError() {
  return (
    <div className="py-20 text-center text-[14px] text-gray-400 font-medium">
      No se pudieron cargar los datos. Intenta de nuevo en unos segundos.
    </div>
  );
}
