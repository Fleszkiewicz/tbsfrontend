export const isEmpty = (v: unknown) =>
    v === "" || v === null || v === undefined || v === 0;

type TripValues = {
    fecha: string;
    fecha_ida: string;
    fecha_vuelta: string;
    destino: string;
    sucursal_id?: number;
    moneda: number;
    valor_total?: number | null;
    valor_total_usd?: number | null;
    cotizacion?: number | null;
    pago?: string;
};

// isCreate = true exige además sucursal y pago. El titular se valida aparte (getPasajerosError).
export function hasMissingTripFields(v: TripValues, isCreate: boolean) {
    const needsArs = v.moneda === 1 || v.moneda === 3;
    const needsUsd = v.moneda === 2 || v.moneda === 3;
    return (
        isEmpty(v.fecha) || isEmpty(v.fecha_ida) || isEmpty(v.fecha_vuelta) ||
        isEmpty(v.destino) || isEmpty(v.moneda) ||
        (isCreate && (isEmpty(v.sucursal_id) || isEmpty(v.pago))) ||
        (needsArs && isEmpty(v.valor_total)) ||
        (needsUsd && (isEmpty(v.valor_total_usd) || isEmpty(v.cotizacion)))
    );
}

export function getTripDateError(v: Pick<TripValues, "fecha_ida" | "fecha_vuelta">) {
    if (v.fecha_ida && v.fecha_vuelta && v.fecha_vuelta < v.fecha_ida) {
        return "La fecha de fin no puede ser anterior a la de inicio";
    }
    return null;
}