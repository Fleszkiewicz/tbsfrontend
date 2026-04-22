import { useTrip, useUpdateTrip } from "../hooks/useTrips";
import { modalStore } from "../store/modalStore";
import { tripsStore } from "../store/tripsStore";
import { IoClose, IoCloseCircle } from "react-icons/io5";
import { renderEstado } from "../utils/utilsTsx";
import { useForm } from "@tanstack/react-form";
import type { UpdateTripRequest, UpdateServiceData } from "../types/types";
import { IoIosAdd, IoIosRemove } from "react-icons/io";
import { toast } from "sonner";
import {
  useCreateService,
  useDeleteService,
  useServices,
} from "../hooks/useServices";
import { useState } from "react";
import { isIsoDate, toDateInput } from "../utils/utils";
import { Spinner } from "./widget/Spinner";

// Local type for Form State including UI-specific fields

export const TripEditModal = () => {
  const { setIsEdit } = modalStore();
  const { setTripId, tripId } = tripsStore();
  const { data: tripResponse, isLoading } = useTrip(tripId!);
  const { updateTripMutate } = useUpdateTrip();
  const { deleteServiceMutate } = useDeleteService();
  const { data: services } = useServices();
  const { createServiceMutate } = useCreateService();
  const [add, setAdd] = useState<boolean>(false);

  const trip = tripResponse?.data;

  const form = useForm({
    defaultValues: {
      apellido: trip?.apellido ?? "",
      destino: trip?.destino ?? "internacional",
      valor_total: trip?.valor_total ?? 0,
      fecha_ida: toDateInput(trip?.fecha_ida) ?? "",
      fecha_vuelta: toDateInput(trip?.fecha_vuelta) ?? "",
      fecha: toDateInput(trip?.fecha) ?? "",
      moneda:
        trip?.moneda?.toLowerCase() === "usd"
          ? 2
          : trip?.moneda?.toLowerCase() === "mixto"
            ? 3
            : 1,
      valor_total_usd: trip?.valor_total_usd ?? 0,
      servicios:
        trip?.servicios?.map((s) => ({
          id: s.id,
          valor: s.valor,
          pagado_por: s.pagado_por,
          moneda:
            (s.moneda as unknown as string)?.toLowerCase() === "usd" ? 2 : 1,
          cotizacion: s.cotizacion,
          observacion: (s as any).observacion ?? null,
        })) ?? [],
      cotizacion: trip?.cotizacion ?? null,
    } as UpdateTripRequest,
    onSubmitInvalid: () => {
      toast.error("Por favor revisá los campos requeridos antes de guardar");
    },
    onSubmit: ({ value }) => {

      const serviciosOriginales = trip?.servicios ?? [];

      // detectamos cambios en servicios (solo los que se modificaron)
      const serviciosActualizados: UpdateServiceData[] = (value.servicios ?? [])
        .filter((s) => {
          const original = serviciosOriginales.find((o) => o.id === s.id);
          if (!original) return true;

          const originalMoneda = (original.moneda as unknown as string)?.toLowerCase() === "usd" ? 2 : 1;
          const originalCotizacion = original.cotizacion != null ? Number(original.cotizacion) : null;
          const originalValor = Number(original.valor);
          const originalObservacion = original.observacion ?? null;
          const sCotizacion = s.cotizacion != null ? Number(s.cotizacion) : null;

          return (
            Number(s.valor) !== originalValor ||
            s.pagado_por !== original.pagado_por ||
            s.moneda !== originalMoneda ||
            sCotizacion !== originalCotizacion ||
            (s.observacion ?? null) !== originalObservacion
          );
        })
        .map((s) => ({
          id: s.id,
          valor: Number(s.valor),
          pagado_por: s.pagado_por,
          moneda: s.moneda,
          cotizacion: s.cotizacion != null ? Number(s.cotizacion) : null,
          observacion: s.observacion ?? null,
        }));
      const valorTotalArsBase =
        value.valor_total ?? trip?.valor_total ?? undefined;
      const valorTotalUsdBase =
        value.valor_total_usd ?? trip?.valor_total_usd ?? undefined;
      const fechaNormalizada = toDateInput(value.fecha ?? trip?.fecha);
      const fechaIdaNormalizada = toDateInput(
        value.fecha_ida ?? trip?.fecha_ida,
      );
      const fechaVueltaNormalizada = toDateInput(
        value.fecha_vuelta ?? trip?.fecha_vuelta,
      );
      const dataUpdated: UpdateTripRequest = {
        apellido: value.apellido ?? trip?.apellido,
        destino: value.destino ?? trip?.destino,
        fecha: fechaNormalizada,
        fecha_ida: fechaIdaNormalizada,
        fecha_vuelta: fechaVueltaNormalizada,
        moneda: value.moneda,
        cotizacion: value.cotizacion ?? trip?.cotizacion ?? null,
        valor_total: valorTotalArsBase,
        valor_total_usd: valorTotalUsdBase,
        servicios: serviciosActualizados,
      };
      updateTripMutate({ tripId: tripId!, dataUpdated });
    },
  });

  if (isLoading || !trip) {
    return (
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-6xl p-6 relative animate-fadeIn text-black flex items-center justify-center min-h-[200px]">
        <Spinner size={40} text="Cargando viaje..." />
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-2xl shadow-lg w-full max-w-6xl p-6 relative animate-fadeIn text-black max-h-[90vh] overflow-y-auto"
      style={{ scrollbarWidth: "none" }}
    >
      <button
        onClick={() => {
          setTripId(null);
          setIsEdit(false);
        }}
        className="absolute top-2 right-3 text-red-500 transition"
      >
        <IoClose size={40} />
      </button>

      <section className="flex flex-col items-center gap-10 w-full">
        <h1 className="font-bold text-4xl text-blue-600 flex items-center gap-2 select-none">
          MODIFICAR LEGAJO Nº <span className="underline">{trip?.id}</span>
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          className="w-full flex flex-col gap-10"
        >
          <div className="flex gap-10">
            {/* Información */}
            <div className="border border-gray-300 rounded-xl p-4 w-full">
              <h1 className="font-bold text-xl text-blue-600 mb-3 select-none">
                Información:
              </h1>

              <div className="mb-3 flex gap-6">
                <div className="w-full">
                  <form.Field name="apellido">
                    {(field) => (
                      <div className="mb-3">
                        <label className="block font-semibold mb-1">
                          Apellido
                        </label>
                        <input
                          className="w-full border rounded px-3 py-2"
                          value={field.state.value ?? ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                        />
                      </div>
                    )}
                  </form.Field>
                </div>
                <div className="w-full">
                  <form.Field name="destino">
                    {(field) => (
                      <div className="mb-3">
                        <label className="block font-semibold mb-1 select-none">
                          Destino:
                        </label>
                        <select
                          onChange={(e) =>
                            field.handleChange(
                              e.target.value as "internacional" | "nacional",
                            )
                          }
                          value={field.state.value ?? "internacional"}
                          className="border p-2 rounded w-full"
                        >
                          <option value="internacional">Internacional</option>
                          <option value="nacional">Nacional</option>
                        </select>
                      </div>
                    )}
                  </form.Field>
                </div>
              </div>

              <form.Field
                name="fecha"
                validators={{
                  onSubmit: ({ value }) => {
                    if (!value) return "La fecha de creación es obligatoria";
                    if (!isIsoDate(value)) return "Formato válido: yyyy-mm-dd";
                  },
                }}
              >
                {(field) => (
                  <div className="flex flex-col mb-3">
                    <label className="block font-semibold mb-1">
                      Fecha de creacion:
                    </label>
                    <input
                      type="date"
                      value={field.state.value || ""}
                      onChange={(e) => field.handleChange(e.target.value)}
                      className="border p-2 rounded w-full"
                    />
                    {field.state.meta.errors.length > 0 && (
                      <em className="text-red-600 text-sm">
                        {field.state.meta.errors.join(", ")}
                      </em>
                    )}
                  </div>
                )}
              </form.Field>

              <div className="flex gap-4 w-full">
                <div className="w-full">
                  <form.Field
                    name="fecha_ida"
                    validators={{
                      onSubmit: ({ value }) => {
                        if (!value) return "La fecha de ida es obligatoria";
                        if (!isIsoDate(value))
                          return "Formato válido: yyyy-mm-dd";
                      },
                    }}
                  >
                    {(field) => (
                      <div className="flex flex-col mb-3">
                        <label className="block font-semibold mb-1">
                          Fecha de ida:
                        </label>
                        <input
                          type="date"
                          value={field.state.value || ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="border p-2 rounded w-full"
                        />
                        {field.state.meta.errors.length > 0 && (
                          <em className="text-red-600 text-sm">
                            {field.state.meta.errors.join(", ")}
                          </em>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>

                <div className="w-full">
                  <form.Field
                    name="fecha_vuelta"
                    validators={{
                      onSubmit: ({ value }) => {
                        if (!value) return "La fecha de vuelta es obligatoria";
                        if (!isIsoDate(value))
                          return "Formato válido: yyyy-mm-dd";
                      },
                    }}
                  >
                    {(field) => (
                      <div className="flex flex-col mb-3">
                        <label className="block font-semibold mb-1">
                          Fecha de vuelta:
                        </label>
                        <input
                          type="date"
                          value={field.state.value || ""}
                          onChange={(e) => field.handleChange(e.target.value)}
                          className="border p-2 rounded w-full"
                        />
                        {field.state.meta.errors.length > 0 && (
                          <em className="text-red-600 text-sm">
                            {field.state.meta.errors.join(", ")}
                          </em>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>
              </div>
              <div>
                <label className="block font-semibold mb-1 select-none">
                  Estado
                </label>
                <p>{trip?.estado && renderEstado(trip.estado)}</p>
              </div>
            </div>

            {/* Detalle económico */}
            <div className="border border-gray-300 rounded-xl p-4 w-full">
              <h1 className="font-bold text-xl text-blue-600 mb-3 select-none">
                Detalle económico:
              </h1>

              {/* Moneda */}
              <div className="mb-4">
                <label className="block font-semibold mb-1 select-none">
                  Moneda
                </label>
                <form.Field name="moneda">
                  {(field) => (
                    <select
                      value={field.state.value}
                      onChange={(e) =>
                        field.handleChange(Number(e.target.value))
                      }
                      className="border p-2 rounded w-full"
                    >
                      <option value={1}>ARS</option>
                      <option value={2}>USD</option>
                      <option value={3}>Mixto</option>
                    </select>
                  )}
                </form.Field>
              </div>

              {/* Dos columnas: ARS | USD */}
              <form.Subscribe selector={(state) => state.values.moneda}>
                {(moneda) => (
                  <div className="flex gap-4">
                    {/* Columna ARS (visible si moneda = ARS o Mixto) */}
                    {(moneda === 1 || moneda === 3) && (
                      <div className="flex-1 border border-blue-200 rounded-lg p-3 bg-blue-50">
                        <h2 className="font-bold text-blue-600 mb-3 text-center">
                          ARS:
                        </h2>

                        <form.Field name="valor_total">
                          {(field) => (
                            <div className="mb-3">
                              <label className="block font-semibold mb-1 select-none text-sm">
                                Valor ARS
                              </label>
                              <input
                                type="text"
                                value={
                                  field.state.value
                                    ? new Intl.NumberFormat("es-AR", {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    }).format(field.state.value)
                                    : ""
                                }
                                onChange={(e) => {
                                  const soloNumeros = e.target.value.replace(
                                    /\D/g,
                                    "",
                                  );
                                  field.handleChange(Number(soloNumeros));
                                }}
                                className="border p-2 rounded w-full"
                              />
                            </div>
                          )}
                        </form.Field>

                        <div className="mb-3">
                          <label className="block font-semibold mb-1 select-none text-sm">
                            Costo ARS
                          </label>
                          <p className="font-semibold">
                            $
                            {trip?.costo !== undefined
                              ? new Intl.NumberFormat("es-AR").format(
                                trip.costo,
                              )
                              : "0"}
                          </p>
                        </div>

                        <div>
                          <label className="block font-semibold mb-1 select-none text-sm">
                            Ganancia ARS
                          </label>
                          <p
                            className={`font-semibold ${(trip?.ganancia ?? 0) < 0 ? "text-red-500" : "text-green-600"}`}
                          >
                            $
                            {trip?.ganancia !== undefined
                              ? new Intl.NumberFormat("es-AR").format(
                                trip.ganancia,
                              )
                              : "0"}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Columna USD (visible si moneda = USD o Mixto) */}
                    {(moneda === 2 || moneda === 3) && (
                      <div className="flex-1 border border-blue-200 rounded-lg p-3 bg-blue-50">
                        <h2 className="font-bold text-blue-600 mb-3 text-center">
                          USD:
                        </h2>

                        <div className="flex gap-2 mb-3">
                          <form.Field name="valor_total_usd">
                            {(field) => (
                              <div className="flex-1">
                                <label className="block font-semibold mb-1 select-none text-sm">
                                  Valor USD
                                </label>
                                <input
                                  type="text"
                                  value={
                                    field.state.value
                                      ? new Intl.NumberFormat("es-AR", {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                      }).format(field.state.value)
                                      : ""
                                  }
                                  onChange={(e) => {
                                    const soloNumeros = e.target.value.replace(
                                      /\D/g,
                                      "",
                                    );
                                    field.handleChange(Number(soloNumeros));
                                  }}
                                  className="border p-2 rounded w-full"
                                />
                              </div>
                            )}
                          </form.Field>

                          <form.Field
                            name="cotizacion"
                            validators={{
                              onSubmit: ({ value }) => {
                                if (moneda === 2 || moneda === 3) {
                                  if (value == null || Number(value) <= 0)
                                    return "La cotización es obligatoria";
                                }
                              },
                            }}
                          >
                            {(field) => (
                              <div className="flex-1">
                                <label className="block font-semibold mb-1 select-none text-sm">
                                  Cotización USD
                                </label>
                                <input
                                  type="text"
                                  value={
                                    field.state.value
                                      ? new Intl.NumberFormat("es-AR", {
                                        minimumFractionDigits: 0,
                                        maximumFractionDigits: 0,
                                      }).format(field.state.value)
                                      : ""
                                  }
                                  onChange={(e) => {
                                    const soloNumeros = e.target.value.replace(
                                      /\D/g,
                                      "",
                                    );
                                    field.handleChange(
                                      soloNumeros === ""
                                        ? null
                                        : Number(soloNumeros),
                                    );
                                  }}
                                  className="border p-2 rounded w-full"
                                />
                                {field.state.meta.errors.length > 0 && (
                                  <em className="text-red-600 text-sm">
                                    {field.state.meta.errors.join(", ")}
                                  </em>
                                )}
                              </div>
                            )}
                          </form.Field>
                        </div>

                        <div className="mb-3">
                          <label className="block font-semibold mb-1 select-none text-sm">
                            Costo USD
                          </label>
                          <p className="font-semibold">
                            U$D{" "}
                            {trip?.costo_usd !== undefined
                              ? new Intl.NumberFormat("es-AR").format(
                                trip.costo_usd,
                              )
                              : "0"}
                          </p>
                        </div>

                        <div>
                          <label className="block font-semibold mb-1 select-none text-sm">
                            Ganancia USD
                          </label>
                          <p
                            className={`font-semibold ${(trip?.ganancia_usd ?? 0) < 0 ? "text-red-500" : "text-green-600"}`}
                          >
                            U$D{" "}
                            {trip?.ganancia_usd !== undefined
                              ? new Intl.NumberFormat("es-AR").format(
                                trip.ganancia_usd,
                              )
                              : "0"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </form.Subscribe>
            </div>
          </div>

          {/* Servicios */}
          <div className="border border-gray-300 rounded-xl p-4">
            <h1 className="font-bold text-xl text-blue-600 mb-4 select-none">
              Servicios:
            </h1>

            <form.Field name="servicios">
              {(field) => (
                <div className="flex flex-col gap-3 px-10">
                  {(field.state.value ?? []).map((s, index) => {
                    return (
                      <div
                        key={s.id}
                        className="flex flex-wrap items-center justify-between gap-3 border p-3 rounded-md select-none"
                      >
                        {/* Nombre */}
                        <div className="capitalize w-40 font-semibold">
                          {
                            services?.data?.find(
                              (service) => service.id === s.id,
                            )?.nombre
                          }
                        </div>

                        {/* Valor */}
                        <div className="flex flex-col">
                          <label className="block text-xs font-semibold mb-1 select-none">
                            Valor:
                          </label>
                          <div className="flex items-center gap-1">
                            <span className="text-xl font-semibold">$</span>
                            <input
                              type="text"
                              className="border py-2 px-4 rounded w-32"
                              value={
                                s.valor
                                  ? new Intl.NumberFormat("es-AR", {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }).format(s.valor)
                                  : ""
                              }
                              onChange={(e) => {
                                const newServicios = [
                                  ...(field.state.value ?? []),
                                ];
                                const soloNumeros = e.target.value.replace(
                                  /\D/g,
                                  "",
                                );
                                newServicios[index] = {
                                  ...s,
                                  valor: Number(soloNumeros),
                                };
                                field.handleChange(newServicios);
                              }}
                            />
                          </div>
                        </div>

                        {/* Moneda */}
                        <div className="flex flex-col">
                          <label className="block text-xs font-semibold mb-1 select-none">
                            Moneda:
                          </label>
                          <select
                            className="border p-2 rounded"
                            value={s.moneda}
                            onChange={(e) => {
                              const newServicios = [
                                ...(field.state.value ?? []),
                              ];
                              newServicios[index] = {
                                ...s,
                                moneda: Number(e.target.value),
                              };
                              field.handleChange(newServicios);
                            }}
                          >
                            <option value={1}>ARS</option>
                            <option value={2}>USD</option>
                          </select>
                        </div>

                        <div className="flex flex-col">
                          <label className="block text-xs font-semibold mb-1 select-none">
                            Cotización:
                          </label>
                          <input
                            type="text"
                            value={s.cotizacion ?? ""}
                            onChange={(e) => {
                              const newServicios = [...(field.state.value ?? [])];
                              const soloNumeros = e.target.value.replace(
                                /\D/g,
                                "",
                              );
                              newServicios[index] = {
                                ...s,
                                cotizacion:
                                  soloNumeros === ""
                                    ? null
                                    : Number(soloNumeros),
                              };
                              field.handleChange(newServicios);
                            }}
                            className="border p-2 rounded w-24"
                          />
                        </div>

                        {/* Pagado por */}
                        <div className="flex flex-col">
                          <label className="block text-xs font-semibold mb-1 select-none">
                            Pagado por:
                          </label>
                          <select
                            className="border p-2 rounded"
                            value={s.pagado_por}
                            onChange={(e) => {
                              const newServicios = [
                                ...(field.state.value ?? []),
                              ];
                              newServicios[index] = {
                                ...s,
                                pagado_por: e.target.value as
                                  | "pendiente"
                                  | "pablo"
                                  | "soledad"
                                  | "mariana"
                                  | "mixto",
                              };
                              field.handleChange(newServicios);
                            }}
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="mariana">Mariana</option>
                            <option value="pablo">Pablo</option>
                            <option value="soledad">Soledad</option>
                            <option value="mixto">Mixto</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold mb-1 select-none">
                            Observación:
                          </label>
                          <input
                            type="text"
                            className="border p-2 rounded"
                            value={s.observacion ?? ""}
                            onChange={(e) => {
                              const newServicios = [
                                ...(field.state.value ?? []),
                              ];
                              newServicios[index] = {
                                ...s,
                                observacion: e.target.value,
                              };
                              field.handleChange(newServicios);
                            }}
                          />
                        </div>

                        {/* Botón eliminar */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            const nombreServicio = services?.data.find(
                              (service) => service.id === s.id,
                            )?.nombre;

                            toast.warning(
                              `¿Estás seguro de que quieres eliminar el servicio "${nombreServicio}"?`,
                              {
                                duration: 2200,
                                action: {
                                  label: "Eliminar",
                                  onClick: () => {
                                    deleteServiceMutate({
                                      serviceId: s.id!,
                                      tripId: trip!.id,
                                    });

                                    const newServicios = (
                                      field.state.value ?? []
                                    ).filter((serv) => serv.id !== s.id);
                                    field.handleChange(newServicios);
                                  },
                                },
                              },
                            );
                          }}
                          className="text-red-500 rounded-full hover:text-red-600"
                        >
                          <IoCloseCircle size={30} />
                        </button>
                      </div>
                    );
                  })}

                  {/* Agregar servicio */}
                  {add &&
                    services?.data.some(
                      (s) =>
                        !(field.state.value ?? []).some((fs) => fs.id === s.id),
                    ) && (
                      <div className="flex items-center justify-between gap-3 border p-3 rounded-md border-blue-500 shadow-sm">
                        <select
                          className="border p-2 rounded w-40 capitalize"
                          onChange={(e) => {
                            const serviceId = Number(e.target.value);

                            if (!serviceId) return;

                            const serviceToAdd = services?.data?.find(
                              (s) => s.id === serviceId,
                            );

                            if (!serviceToAdd) return;

                            field.handleChange([
                              ...(field.state.value ?? []),
                              {
                                id: serviceToAdd.id,
                                valor: 0,
                                pagado_por: "pendiente",
                                moneda: trip?.moneda ? Number(trip.moneda) : 1,
                                cotizacion: null,
                                observacion: null,
                              },
                            ]);

                            createServiceMutate({
                              viaje_id: tripId!,
                              valor: 0,
                              servicio_id: serviceToAdd.id,
                              pagado_por: "pendiente",
                              observacion: null,
                            });

                            setAdd(false);
                          }}
                        >
                          <option value="">Agregar servicio...</option>
                          {services?.data
                            ?.filter(
                              (s) =>
                                !(field.state.value ?? []).some(
                                  (fs) => fs.id === s.id,
                                ),
                            )
                            .map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.nombre}
                              </option>
                            ))}
                        </select>

                        <div className="flex items-center gap-1">
                          <span className="text-xl font-semibold">$</span>
                          <input
                            type="text"
                            className="border py-2 px-4 rounded w-32"
                            disabled
                          />
                        </div>

                        <select className="border p-2 rounded" disabled>
                          <option>Pendiente</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => setAdd(false)}
                          className="text-red-500 rounded-full hover:text-red-600"
                        >
                          <IoCloseCircle size={30} />
                        </button>
                      </div>
                    )}

                  {services?.data?.some(
                    (s) =>
                      !(field.state.value ?? []).some((fs) => fs.id === s.id),
                  ) && (
                      <button
                        type="button"
                        className="border-blue-500 border-2 text-blue-500 self-center flex items-center rounded-full hover:bg-blue-500 hover:text-white transition py-2 px-4"
                        onClick={() => setAdd(true)}
                      >
                        <IoIosAdd className="mr-2" />
                        Agregar servicio
                      </button>
                    )}
                </div>
              )}
            </form.Field>
          </div>

          <div className="flex justify-end gap-4">
            <button
              onClick={() => setIsEdit(false)}
              className="bg-blue-600 text-white rounded-full py-2 px-6 font-semibold transition-all flex items-center gap-2 hover:bg-blue-700"
            >
              <IoCloseCircle />
              Cancelar
            </button>

            <button
              type="button"
              onClick={() => {
                setIsEdit(false);
              }}
              className="bg-red-500 text-white rounded-full py-2 px-6 font-semibold transition-all flex items-center gap-2 hover:bg-red-600"
            >
              <IoIosRemove />
              Eliminar viaje
            </button>

            <button
              type="submit"
              className="bg-green-500 text-white rounded-full py-2 px-6 font-semibold transition-all flex items-center gap-2 hover:bg-green-600"
            >
              <IoIosAdd />
              Guardar cambios
            </button>
          </div>
        </form>
      </section>
    </div>
  );
};
