import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "es" | "en";

type Dict = Record<string, { es: string; en: string }>;

const dict: Dict = {
  appName: { es: "Puente Venezuela", en: "Puente Venezuela" },
  tagline: {
    es: "Conectando necesidades y ayuda en tiempo real",
    en: "Connecting needs and help in real time",
  },
  nav_map: { es: "Mapa", en: "Map" },
  nav_about: { es: "Acerca de", en: "About" },
  nav_emergency: { es: "Emergencia", en: "Emergency" },
  report: { es: "Reportar", en: "Report" },
  newReport: { es: "Nuevo Reporte", en: "New Report" },
  need: { es: "Necesidad", en: "Need" },
  offer: { es: "Oferta", en: "Offer" },
  needs: { es: "Necesidades", en: "Needs" },
  offers: { es: "Ofertas", en: "Offers" },
  needHelp: { es: "Necesito ayuda", en: "I need help" },
  offerHelp: { es: "Ofrezco ayuda", en: "I offer help" },
  all: { es: "Todos", en: "All" },
  allCategories: { es: "Todas las categorías", en: "All categories" },
  reportsCount: { es: "reportes", en: "reports" },
  inProgress: { es: "en curso", en: "in progress" },
  resolved: { es: "resueltos", en: "resolved" },
  pending: { es: "Pendiente", en: "Pending" },
  statusInProgress: { es: "En curso", en: "In progress" },
  statusResolved: { es: "Resuelto", en: "Resolved" },
  list: { es: "Lista", en: "List" },
  mapView: { es: "Mapa", en: "Map" },
  noReports: { es: "No hay reportes con estos filtros.", en: "No reports match these filters." },
  category: { es: "Categoría", en: "Category" },
  title: { es: "Título", en: "Title" },
  description: { es: "Descripción", en: "Description" },
  latitude: { es: "Latitud", en: "Latitude" },
  longitude: { es: "Longitud", en: "Longitude" },
  locationName: { es: "Lugar", en: "Location" },
  urgency: { es: "Urgencia", en: "Urgency" },
  contactName: { es: "Nombre de contacto", en: "Contact name" },
  phone: { es: "Teléfono", en: "Phone" },
  email: { es: "Email", en: "Email" },
  send: { es: "Enviar reporte", en: "Send report" },
  sending: { es: "Enviando...", en: "Sending..." },
  useMyLocation: { es: "Usar mi ubicación", en: "Use my location" },
  cat_water: { es: "Agua", en: "Water" },
  cat_food: { es: "Comida", en: "Food" },
  cat_shelter: { es: "Refugio", en: "Shelter" },
  cat_medicine: { es: "Medicamentos", en: "Medicine" },
  cat_rescue: { es: "Rescate", en: "Rescue" },
  cat_volunteer: { es: "Voluntario", en: "Volunteer" },
  cat_transport: { es: "Transporte", en: "Transport" },
  cat_other: { es: "Otro", en: "Other" },
  urg_1: { es: "1 — Baja", en: "1 — Low" },
  urg_2: { es: "2", en: "2" },
  urg_3: { es: "3 — Media", en: "3 — Medium" },
  urg_4: { es: "4", en: "4" },
  urg_5: { es: "5 — Crítica", en: "5 — Critical" },
  matches: { es: "Coincidencias cercanas", en: "Nearby matches" },
  noMatches: {
    es: "Sin coincidencias por ahora. Comparte para llegar a más gente.",
    en: "No matches yet. Share to reach more people.",
  },
  matchHint: {
    es: "Personas en la zona que pueden ayudar con esta misma categoría:",
    en: "People in the area who can help with this category:",
  },
  matchHintOffer: {
    es: "Personas en la zona que necesitan lo que ofreces:",
    en: "People in the area who need what you offer:",
  },
  contact: { es: "Contactar", en: "Contact" },
  share: { es: "Compartir", en: "Share" },
  assignedTo: { es: "Atendido por", en: "Assigned to" },
  takeAssignment: { es: "Me responsabilizo", en: "I'll handle this" },
  yourName: { es: "Tu nombre", en: "Your name" },
  yourContact: { es: "Teléfono o email", en: "Phone or email" },
  confirm: { es: "Confirmar", en: "Confirm" },
  cancel: { es: "Cancelar", en: "Cancel" },
  markResolved: { es: "Marcar como resuelto", en: "Mark as resolved" },
  reopen: { es: "Reabrir", en: "Reopen" },
  close: { es: "Cerrar", en: "Close" },
  distanceAway: { es: "a {km} km", en: "{km} km away" },
  successReport: { es: "¡Reporte enviado!", en: "Report sent!" },
  errorReport: { es: "Error al enviar reporte", en: "Error sending report" },
  successAssign: { es: "Asignación registrada", en: "Assignment recorded" },
  successStatus: { es: "Estado actualizado", en: "Status updated" },
  invalidCoords: { es: "Coordenadas inválidas", en: "Invalid coordinates" },
  geoFailed: { es: "No fue posible obtener tu ubicación", en: "Could not get your location" },
  radiusKm: { es: "Radio: {km} km", en: "Radius: {km} km" },
  emergencyTitle: { es: "Contactos de emergencia", en: "Emergency contacts" },
  emergencySubtitle: {
    es: "Números oficiales en Venezuela",
    en: "Official numbers in Venezuela",
  },
  about_what: { es: "¿Qué es esta plataforma?", en: "What is this platform?" },
  about_whatBody: {
    es: "Puente Venezuela es una plataforma de coordinación humanitaria que conecta a personas afectadas por los terremotos con quienes pueden ayudar. Visibiliza en tiempo real necesidades y ofertas en el mapa, reduce el desperdicio de recursos y acelera el socorro.",
    en: "Puente Venezuela is a humanitarian coordination platform that connects people affected by the earthquakes with those who can help. It surfaces needs and offers on a live map, reduces wasted resources, and speeds up relief.",
  },
  about_how: { es: "Cómo funciona", en: "How it works" },
  about_step1: { es: "Mapea", en: "Map it" },
  about_step1Body: {
    es: "Reporta una necesidad o una oferta directamente en el mapa.",
    en: "Report a need or an offer directly on the map.",
  },
  about_step2: { es: "Conecta", en: "Connect" },
  about_step2Body: {
    es: "El sistema sugiere coincidencias cercanas por categoría y radio.",
    en: "The system suggests nearby matches by category and radius.",
  },
  about_step3: { es: "Atiende", en: "Help out" },
  about_step3Body: {
    es: "Voluntarios asumen reportes y actualizan el estado en tiempo real.",
    en: "Volunteers take ownership of reports and update the status in real time.",
  },
  about_privacy: { es: "Datos y privacidad", en: "Data and privacy" },
  about_privacyBody: {
    es: "Todos los reportes son públicos para maximizar la visibilidad. Los datos de contacto son opcionales y responsabilidad de quien publica. No almacenamos datos sensibles de salud ni documentos.",
    en: "All reports are public to maximize visibility. Contact details are optional and the responsibility of the publisher. We do not store sensitive health data or documents.",
  },
  back: { es: "Volver al mapa", en: "Back to map" },
  // Nav
  nav_home: { es: "Inicio", en: "Home" },
  // Landing
  landing_heroTitle: {
    es: "Cada minuto cuenta. Cada ayuda llega.",
    en: "Every minute counts. Every helping hand arrives.",
  },
  landing_heroSubtitle: {
    es: "Puente conecta en tiempo real a quienes necesitan ayuda con quienes pueden brindarla, tras los terremotos en Venezuela.",
    en: "Puente connects people who need help with those who can offer it in real time, after the earthquakes in Venezuela.",
  },
  landing_ctaMap: { es: "Ver el mapa", en: "Open the map" },
  landing_ctaReport: { es: "Reportar ayuda", en: "Report help" },
  landing_statsTitle: { es: "Coordinación en tiempo real", en: "Real-time coordination" },
  landing_stat_active: { es: "Reportes activos", en: "Active reports" },
  landing_stat_resolved: { es: "Casos resueltos", en: "Cases resolved" },
  landing_stat_volunteers: { es: "Voluntarios activos", en: "Active volunteers" },
  landing_howTitle: { es: "Cómo funciona", en: "How it works" },
  landing_howSubtitle: {
    es: "Tres pasos simples para que la ayuda llegue donde se necesita.",
    en: "Three simple steps to get help where it's needed.",
  },
  landing_step1: { es: "1. Reporta", en: "1. Report" },
  landing_step1Body: {
    es: "Marca en el mapa una necesidad o una oferta. Sin registro, sin trámites.",
    en: "Pin a need or an offer on the map. No signup, no paperwork.",
  },
  landing_step2: { es: "2. Conecta", en: "2. Match" },
  landing_step2Body: {
    es: "El sistema sugiere coincidencias cercanas por categoría y distancia.",
    en: "The system suggests nearby matches by category and distance.",
  },
  landing_step3: { es: "3. Atiende", en: "3. Act" },
  landing_step3Body: {
    es: "Voluntarios se hacen cargo, comparten fotos y actualizan el estado.",
    en: "Volunteers take ownership, share photos, and update the status.",
  },
  landing_forWhoTitle: { es: "Para quién es", en: "Who it's for" },
  landing_for_victims: { es: "Afectados", en: "Affected people" },
  landing_for_victimsBody: {
    es: "Pide agua, comida, refugio o rescate y déjalo visible para todos.",
    en: "Request water, food, shelter or rescue — visible to everyone.",
  },
  landing_for_volunteers: { es: "Voluntarios", en: "Volunteers" },
  landing_for_volunteersBody: {
    es: "Encuentra dónde tu ayuda hace la mayor diferencia hoy.",
    en: "Find where your help makes the biggest difference today.",
  },
  landing_for_ngos: { es: "ONGs y autoridades", en: "NGOs and authorities" },
  landing_for_ngosBody: {
    es: "Visualiza la demanda real para coordinar recursos sin duplicación.",
    en: "See real demand to coordinate resources without duplication.",
  },
  landing_categoriesTitle: { es: "Categorías cubiertas", en: "Categories covered" },
  landing_emergencyTitle: { es: "¿Es una emergencia?", en: "Is it an emergency?" },
  landing_emergencyBody: {
    es: "Si hay riesgo de vida, llama primero a los números oficiales.",
    en: "If there's a life-threatening risk, call official numbers first.",
  },
  landing_emergencyCta: { es: "Ver contactos de emergencia", en: "View emergency contacts" },
  landing_aboutTitle: { es: "Nuestra misión", en: "Our mission" },
  landing_aboutBody: {
    es: "Tras los terremotos, la información dispersa cuesta vidas. Puente reúne en un solo mapa lo que cada comunidad necesita y lo que cada vecino puede ofrecer, para que ninguna ayuda se pierda.",
    en: "After the earthquakes, scattered information costs lives. Puente brings together on a single map what each community needs and what each neighbor can offer, so no help is wasted.",
  },
  landing_footerRights: { es: "Una plataforma abierta para la comunidad.", en: "An open platform for the community." },
  // Filters
  filter_search: { es: "Buscar...", en: "Search..." },
  filter_searchPlaceholder: {
    es: "Buscar título, descripción o lugar",
    en: "Search title, description or place",
  },
  filter_status: { es: "Estado", en: "Status" },
  filter_period: { es: "Período", en: "Period" },
  filter_period_24h: { es: "Últimas 24h", en: "Last 24h" },
  filter_period_7d: { es: "Últimos 7 días", en: "Last 7 days" },
  filter_period_30d: { es: "Últimos 30 días", en: "Last 30 days" },
  filter_period_all: { es: "Todo el tiempo", en: "All time" },
  filter_minUrgency: { es: "Urgencia mín.", en: "Min. urgency" },
  filter_withPhotos: { es: "Sólo con fotos", en: "Only with photos" },
  filter_clear: { es: "Limpiar filtros", en: "Clear filters" },
  filter_results: { es: "{n} resultados", en: "{n} results" },
  filter_more: { es: "Más filtros", en: "More filters" },
  filter_apply: { es: "Aplicar", en: "Apply" },
  // Attachments
  photos: { es: "Fotos", en: "Photos" },
  addPhotos: { es: "Agregar fotos", en: "Add photos" },
  photoLimit: { es: "Hasta 5 fotos · máx 5MB cada una", en: "Up to 5 photos · max 5MB each" },
  removePhoto: { es: "Quitar", en: "Remove" },
  uploadingPhotos: { es: "Subiendo fotos...", en: "Uploading photos..." },
  // Offline
  offline: { es: "Sin conexión", en: "Offline" },
};


type I18nCtx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: keyof typeof dict, vars?: Record<string, string | number>) => string;
};

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("lang") : null;
    if (stored === "es" || stored === "en") setLangState(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("lang", l);
  };

  const t: I18nCtx["t"] = (key, vars) => {
    const entry = dict[key as string];
    let str = entry ? entry[lang] : (key as string);
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        str = str.replace(`{${k}}`, String(v));
      }
    }
    return str;
  };

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
