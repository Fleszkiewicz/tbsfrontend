import { useServices } from "../../hooks/useServices";
import { toast } from "sonner";
import { useCreateTrip } from "../../hooks/useTrips";
import { modalStore } from "../../store/modalStore";
import type { CreateTripRequest } from "../../types/types";
import { BtnCloseModal } from "../ui/BtnCloseModal";
import { useForm } from "@tanstack/react-form";
import { useState, useEffect } from "react";
import { isIsoDate, toDateInput } from "../../utils/utils";
import { CustomDatePicker } from "../ui/CustomDatePicker";
import { CustomSelect } from "../ui/CustomSelect";

export const TripCreateModal = () => {
  const { setIsCreate } = modalStore();
  const { data: services } = useServices();
  const { mutateAsync: createTrip } = useCreateTrip();
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  const form = useForm({
    defaultValues: {
      moneda: 0,
      valor_total: 0,
      valor_total_usd: 0,
      destino: "",
      apellido: "",
      fecha: today,
      fecha_ida: "",
      fecha_vuelta: "",
      servicios: [],
      cotizacion: null,
    } as CreateTripRequest,
    onSubmit: async ({ value, formApi }) => {
      const trip: CreateTripRequest = {
        fecha_ida: toDateInput(value.fecha_ida),
        fecha_vuelta: toDateInput(value.fecha_vuelta),
        fecha: toDateInput(value.fecha),
        moneda: value.moneda,
        destino: value.destino,
        apellido: value.apellido,
        valor_total: value.moneda === 2 ? 0 : value.valor_total,
        valor_total_usd: (value.moneda === 2 || value.moneda === 3) ? (value.valor_total_usd || (value.moneda === 2 ? value.valor_total : 0)) : 0,
        cotizacion: (value.moneda === 2 || value.moneda === 3) ? value.cotizacion : null,
        servicios: value.servicios.map((s) => {
          const originalService = services?.data?.find((os) => os.id === s.id);
          const isUSD = originalService?.moneda?.toLowerCase() === "usd";
          return {
            id: s.id,
            valor: 0,
            pagado_por: "pendiente",
            moneda: isUSD ? 2 : 1,
            cotizacion: isUSD ? (value.cotizacion ?? null) : null,
          };
        }),
      };

      try {
        await createTrip(trip);
        formApi.reset();
        setIsCreate(false);
      } catch (error: any) {
        console.error("Error al crear viaje desde el modal:", error);
        const errorMsg =
          error?.response?.data?.message ||
          error?.message ||
          "Error al crear el viaje";
        toast.error(errorMsg);
      }
    },
    onSubmitInvalid: () => {
      toast.error("Por favor revisa los campos requeridos");
    },
  });

  const [selectedMoneda, setSelectedMoneda] = useState<number>(
    form.getFieldValue("moneda") ?? 0,
  );

  useEffect(() => {
    const m = form.getFieldValue("moneda");
    setSelectedMoneda(m ?? 0);
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl p-10 relative animate-fadeIn text-black">
      <BtnCloseModal onCLick={() => setIsCreate(false)} />

      <section>
        <div className="flex flex-col items-center gap-10 w-full mb-10">
          <h1 className="font-bold text-4xl text-blue-600 flex items-center gap-2 select-none">
            CREAR VIAJE
          </h1>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <div className="grid grid-cols-2 gap-6 select-none">
            {/* Row 1: Apellido & Destino */}
            <form.Field
              name="apellido"
              validators={{
                onSubmit: ({ value }) => {
                  if (!value) return "Este campo es obligatorio";
                },
              }}
            >
              {(field) => (
                <div className="flex flex-col">
                  <label className="block font-semibold mb-1">Apellido:</label>
                  <input
                    type="text"
                    value={field.state.value}
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

            <form.Field
              name="destino"
              validators={{
                onSubmit: ({ value }) => {
                  if (!value) return "Este campo es obligatorio";
                },
              }}
            >
              {(field) => (
                <div className="flex flex-col">
                  <label className="block font-semibold mb-1">Destino:</label>
                  <CustomSelect
                    value={field.state.value}
                    onChange={(val) =>
                      field.handleChange(val as "nacional" | "internacional" | "")
                    }
                    options={[
                      { label: "Seleccionar", value: "" },
                      { label: "Internacional", value: "internacional" },
                      { label: "Nacional", value: "nacional" },
                    ]}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <em className="text-red-600 text-sm">
                      {field.state.meta.errors.join(", ")}
                    </em>
                  )}
                </div>
              )}
            </form.Field>

            {/* Row 2: Valor & Moneda (with nested Exchange Rate check) */}
            <form.Field
              name="valor_total"
              validators={{
                onSubmit: ({ value }) => {
                  if (!value) return "Este campo es obligatorio";
                },
              }}
            >
              {(field) => (
                <div className="flex flex-col">
                  <label className="block font-semibold mb-1">Valor:</label>
                  <div className="flex items-center gap-1">
                    <span className="text-xl font-semibold text-gray-500">
                      $
                    </span>
                    <input
                      type="text"
                      value={
                        field.state.value &&
                        new Intl.NumberFormat("es-AR", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(field.state.value)
                      }
                      onChange={(e) => {
                        const soloNumeros = e.target.value.replace(/\D/g, "");
                        field.handleChange(Number(soloNumeros));
                      }}
                      className="border p-2 rounded w-full"
                    />
                  </div>
                  {field.state.meta.errors.length > 0 && (
                    <em className="text-red-600 text-sm">
                      {field.state.meta.errors.join(", ")}
                    </em>
                  )}
                </div>
              )}
            </form.Field>

            <div className="flex gap-4">
              <div className="w-full">
                <form.Field
                  name="moneda"
                  validators={{
                    onSubmit: ({ value }) => {
                      if (!value) return "Este campo es obligatorio";
                    },
                  }}
                >
                  {(field) => (
                    <div className="flex flex-col">
                      <label className="block font-semibold mb-1">
                        Moneda:
                      </label>
                      <CustomSelect
                        value={field.state.value ?? 0}
                        onChange={(val) => {
                          const numVal = Number(val) as 0 | 1 | 2 | 3;
                          field.handleChange(numVal);
                          setSelectedMoneda(numVal);

                          if (numVal === 2 || numVal === 3) {
                            form.setFieldValue("cotizacion", 0);
                          } else {
                            form.setFieldValue("cotizacion", null);
                          }
                        }}
                        options={[
                          { label: "Seleccionar", value: 0 },
                          { label: "ARS", value: 1 },
                          { label: "USD", value: 2 },
                          { label: "Mixto", value: 3 },
                        ]}
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

              {selectedMoneda === 3 && (
                <div className="w-full">
                  <form.Field
                    name="valor_total_usd"
                    validators={{
                      onSubmit: ({ value }) => {
                        if (!value || value <= 0) return "El valor USD es obligatorio";
                      },
                    }}
                  >
                    {(field) => (
                      <div className="flex flex-col">
                        <label className="block font-semibold mb-1">Valor USD:</label>
                        <div className="flex items-center gap-1">
                          <span className="text-xl font-semibold text-gray-500">$</span>
                          <input
                            type="text"
                            value={
                              field.state.value &&
                              new Intl.NumberFormat("es-AR", {
                                minimumFractionDigits: 0,
                                maximumFractionDigits: 0,
                              }).format(field.state.value)
                            }
                            onChange={(e) => {
                              const soloNumeros = e.target.value.replace(/\D/g, "");
                              field.handleChange(Number(soloNumeros));
                            }}
                            className="border p-2 rounded w-full"
                          />
                        </div>
                        {field.state.meta.errors.length > 0 && (
                          <em className="text-red-600 text-sm">
                            {field.state.meta.errors.join(", ")}
                          </em>
                        )}
                      </div>
                    )}
                  </form.Field>
                </div>
              )}

              {(selectedMoneda === 2 || selectedMoneda === 3 ||
                form
                  .getFieldValue("servicios")
                  .some(
                    (s) =>
                      services?.data
                        ?.find((service) => service.id === s.id)
                        ?.moneda?.toLowerCase() === "usd",
                  )) && (
                <div className="w-full">
                  <form.Field
                    name="cotizacion"
                    validators={{
                      onChange: ({ value, fieldApi }) => {
                        const moneda = fieldApi.form.getFieldValue("moneda");
                        const hasUSDService = fieldApi.form
                          .getFieldValue("servicios")
                          .some(
                            (s) =>
                              services?.data
                                ?.find((service) => service.id === s.id)
                                ?.moneda?.toLowerCase() === "usd",
                          );

                        if (
                          (moneda === 2 || moneda === 3 || hasUSDService) &&
                          (!value || Number(value) <= 0)
                        ) {
                          return "La cotización debe ser mayor a 0";
                        }
                        return undefined;
                      },
                      onSubmit: ({ value, fieldApi }) => {
                        const moneda = fieldApi.form.getFieldValue("moneda");
                        const hasUSDService = fieldApi.form
                          .getFieldValue("servicios")
                          .some(
                            (s) =>
                              services?.data
                                ?.find((service) => service.id === s.id)
                                ?.moneda?.toLowerCase() === "usd",
                          );

                        if (
                          (moneda === 2 || moneda === 3 || hasUSDService) &&
                          (!value || Number(value) <= 0)
                        ) {
                          return "La cotización es obligatoria y debe ser mayor a 0";
                        }
                      },
                    }}
                  >
                    {(field) => (
                      <div className="flex flex-col">
                        <label className="block font-semibold mb-1 whitespace-nowrap">
                          {selectedMoneda === 2 || selectedMoneda === 3
                            ? "Cotización USD:"
                            : "Cotización Servicios USD:"}
                        </label>
                        <input
                          type="text"
                          value={
                            typeof field.state.value === "number"
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
                          placeholder="$$$"
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
              )}
            </div>

              <form.Field
                name="fecha"
                validators={{
                  onSubmit: ({ value }) => {
                    if (!value) return "La fecha es obligatoria";
                    if (!isIsoDate(value)) return "Formato válido: yyyy-mm-dd";
                  },
                }}
              >
              {(field) => (
                <div className="flex flex-col">
                  <label className="block font-semibold mb-1">
                    Fecha creación:
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
              <form.Field
                name="fecha_ida"
                validators={{
                  onSubmit: ({ value }) => {
                    if (!value) return "La fecha de ida es obligatoria";
                    if (!isIsoDate(value)) return "Formato válido: yyyy-mm-dd";
                  },
                }}
              >
              {(field) => (
                <div className="flex flex-col">
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

              <form.Field
                name="fecha_vuelta"
                validators={{
                  onSubmit: ({ value, fieldApi }) => {
                    if (!value) return "La fecha de vuelta es obligatoria";
                    if (!isIsoDate(value)) return "Formato válido: yyyy-mm-dd";
                    const fechaVuelta = toDateInput(value);
                    const fechaIda = fieldApi.form.getFieldValue("fecha_ida");
                    const fechaIdaNormalizada = toDateInput(fechaIda);
                    if (fechaIdaNormalizada && fechaVuelta < fechaIdaNormalizada) {
                      return "La vuelta no puede ser antes que la ida";
                    }
                  },
                }}
              >
              {(field) => (
                <div className="flex flex-col">
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

            {/* Row 4: Servicios (Full Width) */}
            <div className="col-span-2">
              <form.Field name="servicios">
                {(fieldArray) => {
                  const selectedIds = fieldArray.state.value.map((s) => s.id);

                  const toggleService = (serviceId: number) => {
                    const currentValues = fieldArray.state.value;
                    const exists = currentValues.some(
                      (s) => s.id === serviceId,
                    );

                    if (exists) {
                      const indexToRemove = currentValues.findIndex(
                        (s) => s.id === serviceId,
                      );
                      if (indexToRemove !== -1) {
                        fieldArray.removeValue(indexToRemove);
                      }
                    } else {
                      fieldArray.pushValue({
                        id: serviceId,
                        valor: 0,
                        pagado_por: "pendiente",
                        moneda: form.getFieldValue("moneda") ?? 0,
                        cotizacion: null,
                      });
                    }
                  };

                  return (
                    <div className="flex flex-col select-none">
                      <label className="block font-semibold mb-3">
                        Servicios:
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {services?.data?.map((service) => (
                          <label
                            key={service.id}
                            className="flex items-center gap-2 mb-2 cursor-pointer capitalize hover:bg-gray-50 p-2 rounded transition"
                          >
                            <input
                              type="checkbox"
                              checked={selectedIds.includes(service.id)}
                              onChange={() => toggleService(service.id)}
                              className="form-checkbox h-4 w-4 text-blue-600"
                            />
                            {service.nombre}
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                }}
              </form.Field>
            </div>
          </div>

          <div className="flex justify-center">
            <form.Subscribe selector={(state) => state.isSubmitting}>
              {(isSubmitting) => (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/4 py-2 mt-6 bg-blue-600 text-white rounded hover:bg-blue-700 select-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? "Creando..." : "Crear viaje"}
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </section>
    </div>
  );
};
