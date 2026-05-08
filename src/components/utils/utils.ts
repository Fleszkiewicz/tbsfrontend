import { jwtDecode } from "jwt-decode";
import type { User } from "../types/types";

export function isTokenNearExpiry(
  token: string,
  seconds: number = 90,
): boolean {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token);
    const now = Math.floor(Date.now() / 1000);
    return exp - now < seconds;
  } catch {
    return true;
  }
}

export function decodeToken(token: string | undefined): User | null {
  if (!token) return null;
  const payloadBase64 = token?.split(".")[1];
  const fixedBase64 = payloadBase64.padEnd(
    payloadBase64.length + ((4 - (payloadBase64.length % 4)) % 4),
    "=",
  );

  const decodedPayload = atob(fixedBase64);
  const payload = JSON.parse(decodedPayload);
  const user: User = {
    auth: true,
    nombre: payload.nombre,
    email: payload.email,
    avatar: payload.avatar,
  };

  return user;
}

export const formattedAmount = (amount: number) => {
  return Number(amount).toLocaleString("es-AR");
};

const isValidDateParts = (
  year: string,
  month: string,
  day: string,
): boolean => {
  const yearNum = Number(year);
  const monthNum = Number(month);
  const dayNum = Number(day);

  const parsedDate = new Date(yearNum, monthNum - 1, dayNum);

  return (
    parsedDate.getFullYear() === yearNum &&
    parsedDate.getMonth() + 1 === monthNum &&
    parsedDate.getDate() === dayNum
  );
};

export const toDateInput = (dateStr?: string | null): string => {
  if (!dateStr) return "";

  const normalized = dateStr.trim();
  if (!normalized) return "";

  const dateOnly = normalized.split(/[T ]/)[0];

  const ymdMatch = dateOnly.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (ymdMatch) {
    const [, year, monthRaw, dayRaw] = ymdMatch;
    const month = monthRaw.padStart(2, "0");
    const day = dayRaw.padStart(2, "0");

    if (!isValidDateParts(year, month, day)) {
      return "";
    }

    return `${year}-${month}-${day}`;
  }

  const dmyMatch = dateOnly.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const [, dayRaw, monthRaw, year] = dmyMatch;
    const month = monthRaw.padStart(2, "0");
    const day = dayRaw.padStart(2, "0");

    if (!isValidDateParts(year, month, day)) {
      return "";
    }

    return `${day}-${month}-${year}`;
  }

  return "";
};

export const toDateDisplay = (dateStr?: string | null): string => {
  const isoDate = toDateInput(dateStr);
  if (!isoDate) return "";

  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
};

export const isIsoDate = (dateStr?: string | null): boolean => {
  if (!dateStr) return false;
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return false;

  const [, year, month, day] = match;
  return isValidDateParts(year, month, day);
};
