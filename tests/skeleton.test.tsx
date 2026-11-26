import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { Table } from "../src/layout/Table";
import { FinanceTable } from "../src/components/common/tables/FinanceTable";
import { TripSkeleton } from "../src/components/common/ui/Skeleton";
import { ViewSkeleton } from "../src/components/common/dashboard/DashboardUI";

const count = (html: string, s: string) => html.split(s).length - 1;

describe("skeleton loaders", () => {
  const headers = [
    { label: "Legajo", key: "id" },
    { label: "Fecha", key: "fecha", className: "hidden md:table-cell" },
  ];

  it("Table muestra la cabecera real y filas fantasmas mientras carga", () => {
    const html = renderToString(
      <Table headers={headers} data={[]} renderRow={() => null} isLoading skeletonRows={4} skeletonWidths={["w-16", "w-20 h-5 rounded-full"]} />,
    );
    expect(html).toContain("Legajo");
    expect(html).toContain("animate-pulse");
    expect(count(html, "<tr")).toBe(1 + 4);
    expect(html).not.toContain("No hay expedientes");
    // Las columnas ocultas en mobile se siguen ocultando en el esqueleto
    expect(count(html, "hidden md:table-cell")).toBe(1 + 4);
    // El ancho propio pisa alto y redondeo por defecto
    expect(html).toContain("h-5 rounded-full");
  });

  it("FinanceTable carga 12 meses fantasma o 1 con filtro de mes", () => {
    const anual = renderToString(<FinanceTable financeData={undefined} isLoading />);
    expect(anual).toContain("ARS");
    expect(count(anual, "<tr")).toBe(2 + 12);
    const mensual = renderToString(<FinanceTable financeData={undefined} month={3} viewMode="ARS" isLoading />);
    expect(count(mensual, "<tr")).toBe(2 + 1);
  });

  it("TripSkeleton y ViewSkeleton se dibujan", () => {
    expect(renderToString(<TripSkeleton />)).toContain("animate-pulse");
    const html = renderToString(<ViewSkeleton charts={[{ kind: "donut" }, { kind: "bars", wide: true }, { kind: "list" }]} />);
    expect(count(html, "rounded-2xl p-4")).toBe(3);
    expect(html).toContain("lg:col-span-2");
  });
});
