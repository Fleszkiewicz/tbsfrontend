import { useTrip, useDeleteTrip } from "../../hooks/useTrips";
import { modalStore } from "../../store/modalStore";
import { tripsStore } from "../../store/tripsStore";
import { Spinner } from "../ui/widget/Spinner";
import { formattedAmount } from "../../utils/utils";
import { renderEstado } from "../../utils/utilsTsx";
import { PiXBold } from "react-icons/pi";
import Swal from "sweetalert2";


export const TripModal = () => {
  const { tripId, setTripId } = tripsStore();
  const { data: tripResponse, isLoading } = useTrip(tripId!);
  const { setIsOpen, setIsEdit } = modalStore();
  const { mutate: deleteTrip } = useDeleteTrip();

  const trip = tripResponse?.data;

  const handleClose = () => {
    setTripId(null);
    setIsOpen(false);
  };

  const handleEdit = () => {
    setIsEdit(true);
    setIsOpen(false);
  };

  const handleDelete = () => {
    if (!tripId) return;

    Swal.fire({
      title: `Eliminar reserva con legajo ${tripId}`,
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
        deleteTrip(tripId);
        handleClose();
      }
    });
  };

  return (
    <div className="bg-white rounded-[2rem] shadow-2xl w-[1100px] relative animate-in fade-in zoom-in duration-300 text-black border border-black overflow-hidden">
      {isLoading ? (
        <div className="flex justify-center items-center p-20">
          <Spinner size={50} text="Cargando detalles..." />
        </div>
      ) : (
        <section className="flex flex-col select-none">
          {/* Header Bar - Now at the very top */}
          <div className="bg-black text-white p-5 px-8 flex justify-between items-center shadow-md">
            <h1 className="font-bold text-3xl tracking-tight overflow-hidden">
              LEGAJO Nº <span className="underline decoration-2 underline-offset-8 font-black uppercase">{trip?.id}</span>
            </h1>
            <div className="flex items-center gap-4">
              <button
                onClick={handleEdit}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-5 rounded-xl text-sm transition-all duration-200 active:scale-95 shadow-lg"
              >
                Modificar
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-5 rounded-xl text-sm transition-all duration-200 active:scale-95 shadow-lg"
              >
                Eliminar
              </button>
              <button
                onClick={handleClose}
                className="text-white hover:text-gray-300 transition-colors ml-2"
              >
                <PiXBold size={28} />
              </button>
            </div>
          </div>

          {/* Content Wrapper with padding */}
          <div className="p-8 flex flex-col gap-8">
            <div className="grid grid-cols-2 gap-8">
              {/* Info Card */}
              <div className="flex flex-col border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-sm min-h-[220px]">
                <div className="bg-black text-white px-6 py-2 font-bold text-lg">
                  Informacion :
                </div>
                <div className="p-6 flex flex-col gap-2.5">
                  <div className="flex gap-2 items-center text-[15px]">
                    <span className="font-bold min-w-[80px]">Apellido:</span>
                    <p className="text-gray-600 font-medium capitalize">{trip?.apellido}</p>
                  </div>
                  <div className="flex gap-2 items-center text-[15px]">
                    <span className="font-bold min-w-[80px]">Destino:</span>
                    <p className="text-gray-600 font-medium capitalize">{trip?.destino}</p>
                  </div>
                  <div className="flex gap-2 items-center text-[15px]">
                    <span className="font-bold min-w-[80px]">Fecha creación:</span>
                    <p className="text-gray-600 font-medium">
                      {trip?.fecha && new Date(trip.fecha).toLocaleDateString("es-AR")}
                    </p>
                  </div>
                  <div className="flex gap-4 items-center text-[15px] mt-1">
                    <span className="font-bold min-w-[80px]">Estado:</span>
                    <div>{trip?.estado && renderEstado(trip.estado, trip.fecha_ida, trip.fecha_vuelta)}</div>
                  </div>
                </div>
              </div>

              {/* Economic Card */}
              <div className="flex flex-col border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-sm min-h-[220px]">
                <div className="bg-black text-white px-6 py-2 font-bold text-lg">
                  Detalle economico:
                </div>
                <div className="p-6 flex flex-col gap-2.5">
                  <div className="flex gap-2 items-center text-[15px]">
                    <span className="font-bold min-w-[100px]">Moneda:</span>
                    <p className="text-gray-600 font-medium uppercase">{trip?.moneda}</p>
                  </div>
                  
                  {/* ARS VALUES */}
                  {(trip?.moneda === "ars" || trip?.moneda === "mixto") && (
                    <div className="mt-2 border-l-2 border-blue-500 pl-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">ARS</p>
                      <div className="flex gap-2 items-center text-[15px] mt-0.5">
                        <span className="font-bold min-w-[90px]">Valor total:</span>
                        <p className="text-gray-600 font-semibold">${trip?.valor_total != null ? formattedAmount(trip.valor_total) : 0}</p>
                      </div>
                      <div className="flex gap-2 items-center text-[15px]">
                        <span className="font-bold min-w-[90px]">Costo:</span>
                        <p className="text-gray-600 font-semibold">${trip?.costo != null ? formattedAmount(trip.costo) : 0}</p>
                      </div>
                      <div className="flex gap-2 items-center text-[15px] mt-1">
                        <span className="font-bold min-w-[90px]">Ganancia:</span>
                        <p className={`font-black ${(trip?.ganancia ?? 0) < 0 ? "text-red-700" : "text-green-600"}`}>
                          ${trip?.ganancia != null ? formattedAmount(trip.ganancia) : 0}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* USD VALUES */}
                  {(trip?.moneda === "usd" || trip?.moneda === "mixto") && (
                    <div className="mt-2 border-l-2 border-green-500 pl-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">USD</p>
                      <div className="flex gap-2 items-center text-[15px] mt-0.5">
                        <span className="font-bold min-w-[90px]">Valor total:</span>
                        <p className="text-gray-600 font-semibold">U$D {trip?.valor_total_usd != null ? formattedAmount(trip.valor_total_usd) : 0}</p>
                      </div>
                      <div className="flex gap-2 items-center text-[15px]">
                        <span className="font-bold min-w-[90px]">Costo:</span>
                        <p className="text-gray-600 font-semibold">U$D {trip?.costo_usd != null ? formattedAmount(trip.costo_usd) : 0}</p>
                      </div>
                      <div className="flex gap-2 items-center text-[15px] mt-1">
                        <span className="font-bold min-w-[90px]">Ganancia:</span>
                        <p className={`font-black ${(trip?.ganancia_usd ?? 0) < 0 ? "text-red-700" : "text-green-600"}`}>
                          U$D {trip?.ganancia_usd != null ? formattedAmount(trip.ganancia_usd) : 0}
                        </p>
                      </div>
                    </div>
                  )}

                  {(trip?.moneda === "usd" || trip?.moneda === "mixto" || trip?.cotizacion) && (
                    <div className="flex gap-2 items-center text-[15px] mt-2">
                      <span className="font-bold min-w-[100px]">Cotización:</span>
                      <p className="text-gray-600 font-semibold">${trip?.cotizacion != null ? formattedAmount(trip.cotizacion) : "-"}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Services Section */}
            <div className="flex flex-col border border-gray-200 rounded-3xl overflow-hidden bg-white shadow-sm">
              <div className="bg-black text-white px-6 py-2 font-bold text-lg w-full">
                Servicios :
              </div>
              <div className="p-8">
                <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,2fr] gap-6 font-bold text-sm mb-6 pb-2 border-b border-gray-100">
                  <span>Nombre:</span>
                  <span className="text-center">Valor:</span>
                  <span className="text-center">Moneda:</span>
                  <span className="text-center">Cotización:</span>
                  <span className="text-center">Pago:</span>
                  <span className="text-center">Observación:</span>
                </div>

                {trip?.servicios?.length ? (
                  <div className="flex flex-col gap-5">
                    {trip.servicios.map((s) => (
                      <div
                        key={s.id}
                        className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,2fr] gap-6 items-center border-l-[3.5px] border-blue-400 pl-4 transition-all hover:bg-gray-50/50 py-1"
                      >
                        <span className="capitalize text-[15px] font-semibold text-gray-700">{s.nombre}</span>
                        <span className="text-[15px] font-medium text-gray-700 text-center">${s.valor && formattedAmount(s.valor)}</span>
                        <span className="uppercase text-[15px] font-medium text-gray-700 text-center">{s.moneda}</span>
                        <span className="text-sm font-medium text-gray-500 text-center">
                          {!(trip?.moneda?.toLowerCase() === "ars" && s.moneda?.toLowerCase() === "ars") && s.cotizacion
                            ? `$${formattedAmount(s.cotizacion)}`
                            : "-"}
                        </span>
                        <div className="flex justify-center">
                          {s.pagado_por === "pendiente" ? renderEstado(s.pagado_por) : (
                            <span className="text-[15px] font-medium text-gray-700">{s.pagado_por}</span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-500 italic truncate text-center">
                          {s.observacion || "-"}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 text-center">
                    <p className="text-gray-400 font-medium italic">No hay servicios asociados a este viaje.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
