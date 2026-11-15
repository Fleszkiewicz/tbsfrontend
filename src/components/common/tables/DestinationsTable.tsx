import { Table } from "../../../layout/Table";
import { IoAddOutline } from "react-icons/io5";
import { LuTrash2 } from "react-icons/lu";
import type { DestinoEntry, DestinoServiceDetail } from "../../../types/types";
import { renderEstado } from "../../../utils/utilsTsx";
import { destinoEstado, serviciosEstado } from "../../../utils/destinos";

type DestinationsTableProps = {
  destinos: DestinoEntry[];
  onAdd: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number, e: React.MouseEvent) => void;
  /** Servicios viejos sin destino. Si hay alguno, se muestra una fila extra. */
  sinDestino?: DestinoServiceDetail[];
  onEditSinDestino?: () => void;
};

// Se mantiene exportada por compatibilidad; la lógica vive en utils/destinos.ts
export const getDestinoEstado = destinoEstado;

type Row =
  | { kind: "destino"; d: DestinoEntry; idx: number }
  | { kind: "sin" };

const headers = [
  { label: "Destino", key: "destino" },
  { label: "Desde", key: "inicio" },
  { label: "Hasta", key: "fin" },
  { label: "Servicios", key: "servicios" },
  { label: "Estado", key: "estado" },
  { label: "Acciones", key: "acciones" },
];

const fmt = (iso: string) =>
  iso ? new Date(iso + "T00:00:00").toLocaleDateString("es-AR") : "-";

const tdBase = "py-3 px-4 md:px-5 text-[13px] md:text-[14px] text-center";

export const DestinationsTable = ({
  destinos,
  onAdd,
  onEdit,
  onRemove,
  sinDestino = [],
  onEditSinDestino,
}: DestinationsTableProps) => {
  const rows: Row[] = destinos.map((d, idx) => ({ kind: "destino", d, idx }));
  if (sinDestino.length > 0) rows.push({ kind: "sin" });

  return (
    <Table
      headers={headers}
      data={rows}
      noDataMessage="No hay destinos agregados aún."
      footerAction={
        <button
          type="button"
          onClick={onAdd}
          className="w-full flex items-center justify-center gap-1.5 py-3 text-[13px] font-medium text-gray-500 hover:bg-gray-100 hover:text-black transition-colors"
        >
          <IoAddOutline size={18} />
          Añadir destino
        </button>
      }
      renderRow={(row) => {
        if (row.kind === "sin") {
          return (
            <tr
              key="sin-destino"
              onClick={() => onEditSinDestino?.()}
              className="border-b border-gray-250 hover:bg-gray-100 transition-colors group cursor-pointer"
            >
              <td className={`${tdBase} font-bold text-gray-500 italic whitespace-nowrap`}>
                Sin destino asignado
              </td>
              <td className={`${tdBase} font-medium text-gray-400`}>-</td>
              <td className={`${tdBase} font-medium text-gray-400`}>-</td>
              <td className={`${tdBase} font-medium text-gray-600`}>
                {sinDestino.length}
              </td>
              <td className={tdBase}>{renderEstado(serviciosEstado(sinDestino))}</td>
              <td className={`${tdBase} text-gray-300`}>-</td>
            </tr>
          );
        }

        const { d, idx } = row;
        return (
          <tr
            key={d.destino_id ?? `new-${idx}`}
            onClick={() => onEdit(idx)}
            className="border-b border-gray-250 hover:bg-gray-100 transition-colors group cursor-pointer"
          >
            <td className={`${tdBase} font-bold text-gray-700 capitalize whitespace-nowrap`}>
              {d.destino}
            </td>
            <td className={`${tdBase} font-medium text-gray-600 whitespace-nowrap`}>
              {fmt(d.fecha_desde)}
            </td>
            <td className={`${tdBase} font-medium text-gray-600 whitespace-nowrap`}>
              {fmt(d.fecha_hasta)}
            </td>
            <td className={`${tdBase} font-medium text-gray-600`}>
              {d.servicios.length > 0 ? d.servicios.length : "-"}
            </td>
            <td className={tdBase}>{renderEstado(destinoEstado(d))}</td>
            <td className={tdBase}>
              <div className="flex justify-center">
                <button
                  type="button"
                  className="text-gray-500 hover:text-red-600 transition-colors p-1.5 rounded-lg"
                  onClick={(e) => onRemove(idx, e)}
                  title="Eliminar destino"
                >
                  <LuTrash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        );
      }}
    />
  );
};
