# Puente Venezuela y Colombia — multi-country expansion + usability

Extend the platform to cover the February 2026 Colombia/Ecuador earthquake alongside Venezuela, rename the app, and add features that make requesting and delivering help faster.

## 1. Multi-country support

- Rename app to **Puente Venezuela y Colombia** (ES) / **Puente Venezuela & Colombia** (EN) in the header, manifest, page titles, meta descriptions, footer and About page.
- Add a `country` field to reports (`VE` / `CO`), defaulting existing rows to `VE`.
- Country selector in the header and in the report form; map recenters on the selected country (Caracas for VE, Bogotá/Popayán region for CO) and the "all" view zooms out to both.
- Country filter in the map toolbar and filters sheet; counters split by country.
- Emergency page: separate blocks of official numbers per country (Colombia: 123 emergencias, 119 bomberos, Cruz Roja Colombiana, UNGRD, Servicio Geológico Colombiano).

## 2. New features for usability and help requests

- **Nearby help feed**: "Cerca de mí" view that sorts reports by distance from the user's location, with a radius slider — faster than panning the map on a phone.
- **Request needs list**: each report gets a structured "what is needed" list (item + quantity + fulfilled count) so several donors can cover parts of one request, with a visible progress bar.
- **Updates timeline**: anyone holding a report's link can post a short update ("water delivered", "family relocated"), giving coordinators a history instead of a single status flip.
- **Duplicate detection**: when submitting, warn if a very similar report already exists within ~500 m and the same category, and offer to join it instead of creating a duplicate.
- **Urgency ageing**: reports untouched for over 48 h are highlighted as "sin respuesta" so they don't get buried.
- **Shareable report pages**: dedicated `/report/$id` route with its own social metadata, so a WhatsApp share preview shows the real title and location.
- **Resource hubs layer**: map layer of shelters, water points and medical posts, visually distinct from individual reports.
- **Print/export**: one-click CSV export of the current filtered list for NGOs working offline.

## 3. UX polish

- Country and language selectors grouped in one compact header control on mobile.
- Landing page rewritten for two countries: hero copy, stats split per country, and a country picker that deep-links into the map.

## Technical notes

- Migration: `country` enum column on `reports` (default `VE`, backfill existing rows); new `report_items` table (report_id, label, quantity, fulfilled) and `report_updates` table (report_id, message, author_name), both with GRANTs and RLS matching the current anonymous-friendly model (public read, insert allowed, no anonymous update).
- Distance sorting reuses `src/lib/distance.ts`; duplicate detection runs as a server function query filtered by category + bounding box.
- New route `src/routes/report.$id.tsx` with `head()` metadata from the loaded report; map deep-links to it.
- i18n keys added for every new string in both ES and EN, Spanish primary.
