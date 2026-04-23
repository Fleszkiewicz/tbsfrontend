import React from "react";

type Header = {
  label: string;
  key: string;
};

type Props<T> = {
  headers: Header[];
  data: T[];
  renderRow: (item: T) => React.ReactNode;
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
              <th key={header.key} className="py-2.5 px-4 text-center text-[13px] font-semibold">
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="p-8 text-center text-[14px] font-light text-gray-600 ">
                {noDataMessage}
              </td>
            </tr>
          ) : (
            data.map((item) => renderRow(item))
          )}
        </tbody>
      </table>
    </div>
  );
}

