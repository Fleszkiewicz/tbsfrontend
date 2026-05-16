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
};

export function Table<T>({
  headers,
  data,
  renderRow,
  noDataMessage = "No hay reservas añadidas para este período.",
  footerAction,
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
          <tbody>
            {data.length === 0 ? (
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

