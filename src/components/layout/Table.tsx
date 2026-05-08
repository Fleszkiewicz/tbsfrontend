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
};

export function Table<T>({
  headers,
  data,
  renderRow,
  noDataMessage = "No hay reservas añadidas para este período.",
}: Props<T>) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <table className="w-full border-collapse bg-white">
        <thead>
          <tr className="bg-black text-white ">
            {headers.map((header) => (
              <th key={header.key} className={`py-2.5 px-2 md:px-4 text-center text-[11px] md:text-[13px] font-semibold ${header.className || ""}`}>
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="p-6 md:p-8 text-center text-[12px] md:text-[14px] font-light text-gray-600 ">
                {noDataMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => renderRow(item, index))
          )}
        </tbody>
      </table>
    </div>
  );
}

