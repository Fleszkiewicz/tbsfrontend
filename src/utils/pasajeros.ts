import type { PasajeroApi, PasajeroForm, PasajeroPayload } from "../types/types";
import { buscarPasajerosPorDni } from "../services/pasajeros.services";

export const normalizeDni = (value: string) => value.replace(/[.\s]/g, "");

export const emptyPasajero = (esTitular = false): PasajeroForm => ({
    key: Math.random().toString(36).slice(2, 10),
    pasajero_id: null,
    es_titular: esTitular,
    dni: "",
    dni_original: "",
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    pasaporte: "",
    vencimiento_dni: "",
    vencimiento_pasaporte: "",
    categoria_edad: "",
});

const onlyDate = (value: string | null | undefined) => (value ? value.split("T")[0] : "");

// Datos del backend -> estado del formulario (el titular siempre primero)
export const fromApi = (list: PasajeroApi[] | undefined): PasajeroForm[] =>
    (list ?? [])
        .map((p): PasajeroForm => ({
            key: `p${p.pasajero_id}`,
            pasajero_id: p.pasajero_id,
            es_titular: !!p.es_titular,
            dni: p.dni ?? "",
            dni_original: p.dni ?? "",
            nombre: p.nombre ?? "",
            apellido: p.apellido ?? "",
            email: p.email ?? "",
            telefono: p.telefono ?? "",
            pasaporte: p.pasaporte ?? "",
            vencimiento_dni: onlyDate(p.vencimiento_dni),
            vencimiento_pasaporte: onlyDate(p.vencimiento_pasaporte),
            categoria_edad: p.categoria_edad ?? "",
        }))
        .sort((a, b) => Number(b.es_titular) - Number(a.es_titular));

// Estado del formulario -> cuerpo que espera la API
export const toPayload = (list: PasajeroForm[]): PasajeroPayload[] =>
    list.map((p) => ({
        pasajero_id: p.pasajero_id,
        es_titular: p.es_titular,
        dni: normalizeDni(p.dni) || null,
        nombre: p.nombre.trim() || null,
        apellido: p.apellido.trim(),
        email: p.email.trim() || null,
        telefono: p.telefono.trim() || null,
        pasaporte: p.pasaporte.trim() || null,
        vencimiento_dni: p.vencimiento_dni || null,
        vencimiento_pasaporte: p.vencimiento_pasaporte || null,
        categoria_edad: p.categoria_edad || null,
    }));

// Validaciones que no dependen del servidor
export function getPasajerosError(list: PasajeroForm[], isCreate: boolean): string | null {
    const titular = list.find((p) => p.es_titular);
    if (!titular) return "Falta el titular de la reserva";
    if (!titular.apellido.trim() || (isCreate && !titular.nombre.trim())) {
        return "Complete el nombre y el apellido del titular";
    }
    if (list.some((p) => !p.apellido.trim())) {
        return "Todos los pasajeros necesitan apellido";
    }
    const dnis = list.map((p) => normalizeDni(p.dni)).filter(Boolean);
    if (new Set(dnis).size !== dnis.length) {
        return "Hay un DNI repetido entre los pasajeros";
    }
    return null;
}

// Si un DNI ya pertenece a otra persona del maestro y no se eligió de la lista, se frena el guardado
export async function findDniConflict(list: PasajeroForm[]): Promise<string | null> {
    for (const p of list) {
        const dni = normalizeDni(p.dni);
        if (dni.length < 3) continue;
        const matches = await buscarPasajerosPorDni(dni);
        const exact = matches.find((m) => m.dni === dni);
        if (exact && exact.id !== p.pasajero_id) {
            const quien = [exact.nombre, exact.apellido].filter(Boolean).join(" ");
            return `El DNI ${dni} ya pertenece a ${quien}. Selecciónalo de la lista desplegable.`;
        }
    }
    return null;
}