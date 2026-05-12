import { Table } from "../../layout/Table";
import { IoAddOutline } from "react-icons/io5";
import { LuTrash2 } from "react-icons/lu";
import type { DestinoEntry } from "../../types/types";

type DestinationsTableProps = {
  destinos: DestinoEntry[];
  onAdd: () => void;
  onEdit: (index: number) => void;
  onRemove: (index: number, e: React.MouseEvent) => void;
};

const headers = [
  { label: "Destino", key: "destino" },
  { label: "Desde", key: "inicio" },
  { label: "Hasta", key: "fin" },
  { label: "Servicios", key: "servicios" },
  { label: "Estado", key: "estado" },
  { label: "Acciones", key: "acciones" },
];

export const DestinationsTable = ({
  destinos,
  onAdd,
  onEdit,
  onRemove,
}: DestinationsTableProps) => {
  return (
    <Table
      headers={headers}
      data={destinos}
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
      renderRow={(d, idx) => (
        <tr
          key={idx}
          onClick={() => onEdit(idx)}
          className="border-b border-gray-250 hover:bg-gray-100 transition-colors group cursor-pointer"
        >
          <td className="py-3 px-2 md:px-4 text-[12px] md:text-[13px] font-bold text-gray-700 capitalize text-center">
            {d.destino}
          </td>
          <td className="py-3 px-2 md:px-4 text-[12px] md:text-[13px] font-medium text-gray-600 text-center">
            {d.fecha_ida ? new Date(d.fecha_ida + "T00:00:00").toLocaleDateString("es-AR") : "-"}
          </td>
          <td className="py-3 px-2 md:px-4 text-[12px] md:text-[13px] font-medium text-gray-600 text-center">
            {d.fecha_vuelta ? new Date(d.fecha_vuelta + "T00:00:00").toLocaleDateString("es-AR") : "-"}
          </td>
          <td className="py-3 px-2 md:px-4 text-[12px] md:text-[13px] font-medium text-gray-600 text-center">
            {d.servicios.length > 0 ? d.servicios.length : "-"}
          </td>
          <td className="py-3 px-2 md:px-4 text-[12px] md:text-[13px] font-medium text-gray-400 text-center">
            -
          </td>
          <td className="py-3 px-1 md:px-3 text-center">
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
      )}
    />
  );
};
