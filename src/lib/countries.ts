export type CountryCode = "VE" | "CO";
export type CountryScope = CountryCode | "all";

export interface CountryMeta {
  code: CountryCode;
  flag: string;
  name: { es: string; en: string };
  center: [number, number];
  zoom: number;
  defaultLocationPlaceholder: string;
}

export const COUNTRIES: Record<CountryCode, CountryMeta> = {
  VE: {
    code: "VE",
    flag: "🇻🇪",
    name: { es: "Venezuela", en: "Venezuela" },
    center: [10.48, -66.9],
    zoom: 7,
    defaultLocationPlaceholder: "Caracas, El Hatillo",
  },
  CO: {
    code: "CO",
    flag: "🇨🇴",
    name: { es: "Colombia", en: "Colombia" },
    center: [3.45, -76.53],
    zoom: 6,
    defaultLocationPlaceholder: "Cali, Valle del Cauca",
  },
};

export const COUNTRY_CODES: CountryCode[] = ["VE", "CO"];

/** Center that comfortably shows both countries. */
export const BOTH_CENTER: [number, number] = [7.0, -71.5];
export const BOTH_ZOOM = 5;

export function isCountryCode(v: unknown): v is CountryCode {
  return v === "VE" || v === "CO";
}

/** Rough nearest-country guess from coordinates (used to pre-fill the form). */
export function guessCountry(lat: number, lng: number): CountryCode {
  const dVE = Math.hypot(lat - COUNTRIES.VE.center[0], lng - COUNTRIES.VE.center[1]);
  const dCO = Math.hypot(lat - COUNTRIES.CO.center[0], lng - COUNTRIES.CO.center[1]);
  return dCO < dVE ? "CO" : "VE";
}

export interface EmergencyContact {
  key: string;
  name: { es: string; en: string };
  number: string;
  icon: "phone" | "flame" | "shield" | "heart" | "activity" | "radio";
}

export const EMERGENCY_CONTACTS: Record<CountryCode, EmergencyContact[]> = {
  VE: [
    { key: "ve-911", name: { es: "Emergencias generales", en: "General emergencies" }, number: "911", icon: "phone" },
    { key: "ve-bomberos", name: { es: "Bomberos", en: "Fire department" }, number: "171", icon: "flame" },
    { key: "ve-pc", name: { es: "Protección Civil", en: "Civil Protection" }, number: "0800-3625428", icon: "shield" },
    { key: "ve-cruzroja", name: { es: "Cruz Roja Venezolana", en: "Venezuelan Red Cross" }, number: "+58 212 571-4380", icon: "heart" },
    { key: "ve-funvisis", name: { es: "FUNVISIS (sismología)", en: "FUNVISIS (seismology)" }, number: "+58 212 257-7672", icon: "activity" },
    { key: "ve-radio", name: { es: "Radio nacional (info)", en: "National radio (info)" }, number: "630 AM / 91.1 FM", icon: "radio" },
  ],
  CO: [
    { key: "co-123", name: { es: "Línea única de emergencias", en: "Single emergency line" }, number: "123", icon: "phone" },
    { key: "co-bomberos", name: { es: "Bomberos", en: "Fire department" }, number: "119", icon: "flame" },
    { key: "co-ungrd", name: { es: "UNGRD (gestión del riesgo)", en: "UNGRD (disaster management)" }, number: "+57 601 552-9696", icon: "shield" },
    { key: "co-cruzroja", name: { es: "Cruz Roja Colombiana", en: "Colombian Red Cross" }, number: "132", icon: "heart" },
    { key: "co-sgc", name: { es: "Servicio Geológico Colombiano", en: "Colombian Geological Survey" }, number: "+57 601 220-0200", icon: "activity" },
    { key: "co-defensa", name: { es: "Defensa Civil", en: "Civil Defense" }, number: "144", icon: "radio" },
  ],
};

export type HubKind = "shelter" | "water" | "medical";

export interface ResourceHub {
  id: string;
  country: CountryCode;
  kind: HubKind;
  name: { es: string; en: string };
  lat: number;
  lng: number;
}

/** Curated public reference points (official shelters, water points, medical posts). */
export const RESOURCE_HUBS: ResourceHub[] = [
  { id: "ve-h1", country: "VE", kind: "shelter", name: { es: "Refugio Poliedro de Caracas", en: "Poliedro de Caracas shelter" }, lat: 10.4531, lng: -66.9494 },
  { id: "ve-h2", country: "VE", kind: "medical", name: { es: "Hospital Universitario de Caracas", en: "Caracas University Hospital" }, lat: 10.4899, lng: -66.8925 },
  { id: "ve-h3", country: "VE", kind: "water", name: { es: "Punto de agua — Plaza Bolívar, Maracaibo", en: "Water point — Plaza Bolívar, Maracaibo" }, lat: 10.6427, lng: -71.6125 },
  { id: "ve-h4", country: "VE", kind: "shelter", name: { es: "Refugio Forum de Valencia", en: "Forum de Valencia shelter" }, lat: 10.1817, lng: -67.9975 },
  { id: "co-h1", country: "CO", kind: "shelter", name: { es: "Coliseo El Pueblo, Cali", en: "El Pueblo Coliseum, Cali" }, lat: 3.4211, lng: -76.5417 },
  { id: "co-h2", country: "CO", kind: "medical", name: { es: "Hospital Universitario del Valle", en: "Valle University Hospital" }, lat: 3.4362, lng: -76.5424 },
  { id: "co-h3", country: "CO", kind: "shelter", name: { es: "Coliseo Popayán", en: "Popayán Coliseum" }, lat: 2.4448, lng: -76.6147 },
  { id: "co-h4", country: "CO", kind: "water", name: { es: "Punto de agua — Parque Nariño, Pasto", en: "Water point — Parque Nariño, Pasto" }, lat: 1.2136, lng: -77.2811 },
];
