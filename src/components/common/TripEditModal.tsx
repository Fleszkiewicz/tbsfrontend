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
import { formattedAmount } from "../utils/utils";
import { useState, useEffect } from "react";
import { CustomDatePicker } from "./CustomDatePicker";
import { CustomSelect } from "./CustomSelect";

// Local type for Form State including UI-specific fields

export const TripEditModal = () => {
  const { setIsEdit } = modalStore();
  const { setTripId, tripId } = tripsStore();
  const { data: tripResponse } = useTrip(tripId!);
  const { updateTripMutate } = useUpdateTrip();
  const { deleteServiceMutate } = useDeleteService();
  const { data: services } = useServices();
  const { createServiceMutate } = useCreateService();
  const [add, setAdd] = useState<boolean>(false);

  const trip = tripResponse?.data;

  if (trip) {
    // Trip loaded
  }

  const form = useForm({
    defaultValues: {
      apellido: trip?.apellido,
      destino: trip?.destino,
      valor_total: trip?.valor_total,
      fecha_ida: trip?.fecha_ida,
      fecha_vuelta: trip?.fecha_vuelta,
      fecha: trip?.fecha,
      moneda: trip?.moneda?.toLowerCase() === "usd" ? 2 : trip?.moneda?.toLowerCase() === "mixto" ? 3 : 1,
      valor_total_usd: trip?.valor_total_usd ?? 0,
      servicios:
        trip?.servicios?.map((s) => ({
          id: s.id,
          valor: s.valor,
          pagado_por: s.pagado_por,
          moneda:
            (s.moneda as unknown as string)?.toLowerCase() === "usd" ? 2 : 1,
          cotizacion: s.cotizacion,
          observacion: s.observacion,
        })) ?? [],
      cotizacion: trip?.cotizacion ?? null,
    } as UpdateTripRequest,
    onSubmit: ({ value }) => {
      const serviciosOriginales = trip?.servicios ?? [];

      // detectamos cambios en servicios (solo los que se modificaron)
      const serviciosActualizados: UpdateServiceData[] = (value.servicios ?? [])
        .filter((s) => {
          const original = serviciosOriginales.find((o) => o.id === s.id);
          // Check if original exists and compare values.
          // Note: original.tipo_cambio_id vs s.valor_tasa_cambio
          if (!original) return true; // New service? (Shouldn't happen here usually but safe to include)

          return (
            s.valor !== original.valor ||
            s.pagado_por !== original.pagado_por ||
            s.moneda !==
            ((original.moneda as unknown as string)?.toLowerCase() === "usd"
              ? 2
              : 1) ||
            s.cotizacion !== (original.cotizacion ?? null) ||
            s.observacion !== (original.observacion ?? null)
          );
        })
        .map((s) => ({
          id: s.id,
          valor: Number(s.valor),
          pagado_por: s.pagado_por,
          moneda: s.moneda,
          cotizacion: s.cotizacion ?? null,
          observacion: s.observacion ?? null,
        }));

      const dataUpdated: UpdateTripRequest = {
        apellido: value.apellido ?? trip?.apellido,
        valor_total: Number(value.valor_total ?? trip?.valor_total),
        valor_total_usd: Number(value.valor_total_usd ?? trip?.valor_total_usd),
        destino: value.destino ?? trip?.destino,
        fecha: value.fecha ?? trip?.fecha,
        fecha_ida: value.fecha_ida ?? trip?.fecha_ida,
        fecha_vuelta: value.fecha_vuelta ?? trip?.fecha_vuelta,
        cotizacion: value.cotizacion,
        moneda: value.moneda,
        servicios: serviciosActualizados,
      };
      updateTripMutate({ tripId: tripId!, dataUpdated });
    },
  });

  const toDateInput = (dateStr?: string | null): string => {
    if (!dateStr) return "";
    return dateStr.substring(0, 10);
  };

  useEffect(() => {
    if (!trip) return;
    form.reset({
      apellido: trip.apellido ?? "",
      destino:
        (trip.destino as "internacional" | "nacional") ?? "internacional",
      valor_total: trip.valor_total ?? 0,
      fecha_ida: toDateInput(trip.fecha_ida),
      fecha_vuelta: toDateInput(trip.fecha_vuelta),
      fecha: toDateInput(trip.fecha),
      moneda: trip.moneda?.toLowerCase() === "usd" ? 2 : trip.moneda?.toLowerCase() === "mixto" ? 3 : 1,
      valor_total_usd: trip.valor_total_usd ?? 0,
      cotizacion: trip.cotizacion ?? null,
      servicios:
        trip.servicios?.map((s) => ({
          id: s.id,
          valor: s.valor ?? 0,
          pagado_por: s.pagado_por ?? "pendiente",
          moneda:
            (s.moneda as unknown as string)?.toLowerCase() === "usd" ? 2 : 1,
          cotizacion: s.cotizacion ?? null,
          observacion: s.observacion ?? null,
        })) ?? [],
    } as UpdateTripRequest);
  }, [trip, form]);

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
                        <label className="block font-semibold mb-1">Apellido</label>
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
                        <CustomSelect
                          value={field.state.value ?? "internacional"}
                          onChange={(val) =>
                            field.handleChange(val as "internacional" | "nacional")
                          }
                          options={[
                            { label: "Internacional", value: "internacional" },
                            { label: "Nacional", value: "nacional" },
                          ]}
                        />
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
                  },
                }}
              >
                {(field) => (
                  <div className="flex flex-col mb-3">
                    <label className="block font-semibold mb-1">
                      Fecha de creacion:
                    </label>
                    <CustomDatePicker
                      value={field.state.value || ""}
                      onChange={(val) => field.handleChange(val)}
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
                      },
                    }}
                  >
                    {(field) => (
                      <div className="flex flex-col mb-3">
                        <label className="block font-semibold mb-1">
                          Fecha de ida:
                        </label>
                        <CustomDatePicker
                          value={field.state.value || ""}
                          onChange={(val) => field.handleChange(val)}
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
                      },
                    }}
                  >
                    {(field) => (
                      <div className="flex flex-col mb-3">
                        <label className="block font-semibold mb-1">
                          Fecha de vuelta:
                        </label>
                        <CustomDatePicker
                          value={field.state.value || ""}
                          onChange={(val) => field.handleChange(val)}
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
                <p>{trip?.estado && renderEstado(trip.estado, trip.fecha_ida, trip.fecha_vuelta)}</p>
              </div>
            </div>

            {/* Detalle económico */}
            <div className="border border-gray-300 rounded-xl p-4 w-full">
              <h1 className="font-bold text-xl text-blue-600 mb-3 select-none">
                Detalle económico:
              </h1>

              {/* Moneda + (si aplica) cotización USD en ARS al lado */}
              <div className="mb-3 flex items-start gap-6">
                <div className="w-1/2">
                  <label className="block font-semibold mb-1 select-none">
                    Moneda
                  </label>
                  <form.Field name="moneda">
                    {(field) => (
                      <CustomSelect
                        value={field.state.value ?? ""}
                        onChange={(val) => field.handleChange(Number(val))}
                        options={[
                          { label: "ARS", value: 1 },
                          { label: "USD", value: 2 },
                          { label: "Mixto", value: 3 },
                        ]}
                      />
                    )}
                  </form.Field>
                </div>

                <form.Subscribe selector={(state) => state.values.moneda}>
                  {(moneda) =>
                    moneda === 2 || moneda === 3 ? (
                      <div className="w-1/2">
                        <form.Field
                          name="cotizacion"
                          validators={{
                            onSubmit: ({ value }) => {
                              if (Number(moneda) === 2 || Number(moneda) === 3) {
                                if (value == null)
                                  return "La cotización es obligatoria";
                                if (Number(value) <= 0)
                                  return "La cotización debe ser mayor a 0";
                              }
                            },
                          }}
                        >
                          {(field) => (
                            <div>
                              <label className="block font-semibold mb-1 select-none">
                                Cotización USD en ARS
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
                    ) : (
                      <div className="w-1/2"></div>
                    )
                  }
                </form.Subscribe>
              </div>

              <form.Subscribe selector={(state) => state.values.moneda}>
                {(moneda) => (
                  <div className="flex gap-4">
                    {(moneda === 1 || moneda === 3) && (
                      <form.Field name="valor_total">
                        {(field) => (
                          <div className="mb-3 w-full">
                            <label className="block font-semibold mb-1 select-none">
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
                                const soloNumeros = e.target.value.replace(/\D/g, "");
                                field.handleChange(Number(soloNumeros));
                              }}
                              className="border p-2 rounded w-full"
                            />
                          </div>
                        )}
                      </form.Field>
                    )}

                    {(moneda === 2 || moneda === 3) && (
                      <form.Field name="valor_total_usd">
                        {(field) => (
                          <div className="mb-3 w-full">
                            <label className="block font-semibold mb-1 select-none">
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
                                const soloNumeros = e.target.value.replace(/\D/g, "");
                                field.handleChange(Number(soloNumeros));
                              }}
                              className="border p-2 rounded w-full"
                            />
                          </div>
                        )}
                      </form.Field>
                    )}
                  </div>
                )}
              </form.Subscribe>

              <div className="mb-3">
                <label className="block font-semibold mb-1 select-none">
                  Costo
                </label>
                <p>${trip?.costo && formattedAmount(trip.costo)}</p>
              </div>

              <div>
                <label className="block font-semibold mb-1 select-none">
                  Ganancia
                </label>
                <p>${trip?.ganancia && formattedAmount(trip.ganancia)}</p>
              </div>
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
                          <CustomSelect
                            className="w-24"
                            value={s.moneda}
                            onChange={(val) => {
                              const newServicios = [...(field.state.value ?? [])];
                              newServicios[index] = {
                                ...s,
                                moneda: Number(val),
                              };
                              field.handleChange(newServicios);
                            }}
                            options={[
                              { label: "ARS", value: 1 },
                              { label: "USD", value: 2 },
                            ]}
                          />
                        </div>

                        {/* Verifica si aplica cotización (Mostrar SIEMPRE salvo que AMBOS sean ARS) */}
                        {!(
                          Number(field.form.getFieldValue("moneda")) === 1 &&
                          Number(s.moneda) === 1
                        ) && (
                            <div className="flex flex-col">
                              <label className="block text-xs font-semibold mb-1 select-none">
                                Cotización:
                              </label>
                              <input
                                type="text"
                                value={s.cotizacion ?? ""}
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
                          )}

                        {/* Pagado por */}
                        <div className="flex flex-col">
                          <label className="block text-xs font-semibold mb-1 select-none">
                            Pagado por:
                          </label>
                          <CustomSelect
                            className="w-32"
                            value={s.pagado_por}
                            onChange={(val) => {
                              const newServicios = [...(field.state.value ?? [])];
                              newServicios[index] = {
                                ...s,
                                pagado_por: val as "pendiente" | "pablo" | "soledad" | "mariana" | "mixto",
                              };
                              field.handleChange(newServicios);
                            }}
                            options={[
                              { label: "Pendiente", value: "pendiente" },
                              { label: "Mariana", value: "mariana" },
                              { label: "Pablo", value: "pablo" },
                              { label: "Soledad", value: "soledad" },
                              { label: "Mixto", value: "mixto" },
                            ]}
                          />
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
                        <CustomSelect
                          className="w-48 capitalize"
                          value=""
                          onChange={(val) => {
                            const serviceId = Number(val);
                            if (!serviceId) return;
                            const serviceToAdd = services?.data?.find((s) => s.id === serviceId);
                            if (!serviceToAdd) return;
                            field.handleChange([
                              ...(field.state.value ?? []),
                              {
                                id: serviceToAdd.id,
                                valor: 0,
                                pagado_por: "pendiente",
                                moneda: Number(trip?.moneda) ?? 1,
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
                          options={[
                            { label: "Agregar servicio...", value: "" },
                            ...(services?.data
                              ?.filter((s) => !(field.state.value ?? []).some((fs) => fs.id === s.id))
                              .map((s) => ({ label: s.nombre, value: s.id })) ?? []),
                          ]}
                        />

                        <div className="flex items-center gap-1">
                          <span className="text-xl font-semibold">$</span>
                          <input
                            type="text"
                            className="border py-2 px-4 rounded w-32"
                            disabled
                          />
                        </div>

                        <CustomSelect
                          className="w-32"
                          disabled
                          value="pendiente"
                          onChange={() => {}}
                          options={[{ label: "Pendiente", value: "pendiente" }]}
                        />

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
