import React from "react";

type Header = {
  label: string;
  key: string;
  className?: string;
};

type Props<T> = {
  headers: Header[];
  data: T[];
  renderRow: (item: T, index: number) => React.ReactNode;
  noDataMessage?: string;
  footerAction?: React.ReactNode;
  /** Mientras carga: filas fantasmas en lugar de los datos */
  isLoading?: boolean;
  /** Ancho del bloque de cada columna (clases de Tailwind), en el orden de `headers` */
  skeletonWidths?: string[];
  skeletonRows?: number;
};

export function Table<T>({
  headers,
  data,
  renderRow,
  noDataMessage = "No hay expedientes añadidos para este período.",
  footerAction,
  isLoading = false,
  skeletonWidths = [],
  skeletonRows = 10,
}: Props<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white flex flex-col">
      <div className="overflow-x-auto w-full">
        <table className="w-full min-w-max border-collapse bg-white">
          <thead>
            <tr className="bg-black text-white ">
              {headers.map((header) => (
                <th key={header.key} className={`py-3 px-4 md:px-5 text-center text-[12px] md:text-[13px] font-semibold whitespace-nowrap ${header.className || ""}`}>
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={isLoading ? "animate-pulse" : undefined} aria-busy={isLoading || undefined}>
            {isLoading ? (
              Array.from({ length: skeletonRows }, (_, row) => (
                <tr key={row} className="border-b border-gray-250">
                  {headers.map((header, col) => {
                    // Cada columna puede pisar alto y redondeo (ej. el badge de estado)
                    const bone = skeletonWidths[col] ?? "w-16";
                    const h = bone.includes("h-") ? "" : "h-3.5";
                    const r = bone.includes("rounded") ? "" : "rounded-md";
                    return (
                      <td key={header.key} className={`py-3 md:py-4 px-2 md:px-4 ${header.className || ""}`}>
                        <div className={`bg-gray-200 mx-auto ${h} ${r} ${bone}`} />
                      </td>
                    );
                  })}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={headers.length} className="p-6 md:p-8 text-center text-[13px] font-medium text-gray-400 ">
                  {noDataMessage}
                </td>
              </tr>
            ) : (
              data.map((item, index) => renderRow(item, index))
            )}
          </tbody>
        </table>
      </div>
      {footerAction && (
        <div className="border-t border-gray-100 bg-white">
          {footerAction}
        </div>
      )}
    </div>
  );
}

