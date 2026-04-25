import { Table } from "../layout/Table";
import { FiTrash2, FiEdit2 } from "react-icons/fi";
import type { Trip } from "../types/types";
import { tripsStore } from "../store/tripsStore";
import { modalStore } from "../store/modalStore";
import { useDeleteTrip } from "../hooks/useTrips";
import Swal from "sweetalert2";
import { renderEstado } from "../utils/utilsTsx";

const headers = [
  { label: "Legajo", key: "id" },
  { label: "Apellido", key: "apellido" },
  { label: "Fecha creación", key: "fecha", className: "hidden md:table-cell" },
  { label: "Estado", key: "estado" },
  { label: "Acciones", key: "acciones" },
];

export function TripsTable({
  filteredTrips,
}: {
  filteredTrips: Trip[] | undefined;
}) {
  const { setTripId } = tripsStore();
  const { setIsOpen } = modalStore();
  const { mutate: trip } = useDeleteTrip();

  const handleDelete = (id: string) => {
    trip(id);
  };
  return (
    <div className="select-none">
      <Table
        headers={headers}
        data={filteredTrips || []}
        renderRow={(trip) => (
          <tr
            key={trip.id}
            className="border-b border-gray-250 hover:bg-gray-100 transition-colors cursor-pointer group "
            onClick={() => {
              setIsOpen(true);
              setTripId(trip.id);
            }}
          >
            <td className="py-3 px-2 md:px-4 text-[12px] md:text-sm font-bold text-gray-700 text-center">{trip.id}</td>
            <td className="py-3 px-2 md:px-4 text-[12px] md:text-sm font-medium text-gray-600 capitalize text-center">{trip.apellido}</td>
            <td className="py-3 px-2 md:px-4 text-[12px] md:text-sm font-medium text-gray-600 text-center hidden md:table-cell">
              {new Date(trip.fecha).toLocaleDateString("es-AR")}
            </td>
            <td className="py-3 px-2 md:px-4 text-center">
              {renderEstado(trip.estado)}
            </td>
            <td className="py-3 px-1 md:px-3 text-center">
              <div className="flex justify-center gap-">
                <button
                  className="text-blue-600 hover:text-blue-700 transition-colors hover:bg-blue-100 p-1 md:p-1.5 rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    setTripId(trip.id);
                    setIsOpen(true);
                  }}
                  title="Ver detalles"
                >
                  <FiEdit2 size={16} />
                </button>
                <button
                  className="text-red-500 hover:text-red-600 transition-colors hover:bg-red-100 p-1.5 rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    Swal.fire({
                      title: `Eliminar reserva con legajo ${trip.id}`,
                      text: "¿Estás seguro? Esta acción es irreversible.",
                      width: "300px",
                      showCancelButton: true,
                      confirmButtonText: "Eliminar",
                      cancelButtonText: "Cancelar",
                      reverseButtons: true,
                      backdrop: `rgba(0,0,0,0.3)`,
                      color: "#1D1D1F",
                      background: "#ffffff",
                      customClass: {
                        popup: "rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 py-5 px-3",
                        title: "text-[16px] font-semibold text-black mt-0",
                        htmlContainer: "text-[13px] text-gray-500 font-medium mt-1 mb-6 mx-0",
                        actions: "flex w-full gap-2 px-3 m-0",
                        confirmButton: "flex-1 bg-[#FF3B30] hover:bg-[#E3342B] text-white font-semibold py-2.5 rounded-xl transition-colors text-[13px] m-0",
                        cancelButton: "flex-1 bg-[#e8e8e8] hover:bg-[#dcdcdc] text-black font-semibold py-2.5 rounded-xl transition-colors text-[13px] m-0"
                      }
                    }).then((result) => {
                      if (result.isConfirmed) {
                        handleDelete(trip.id);
                      }
                    });
                  }}
                  title="Eliminar"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            </td>
          </tr>
        )}


      />
    </div>
  );
}
