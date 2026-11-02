// Testdaten der erfundenen Lumora Systeme AG. Keine echten Firmen, Personen oder Zahlen.
// Zielbild: Koffer und Muster kommen aus der Produktdaten-API (PIM) über die Integration Suite,
// Personen pseudonymisiert aus Entra ID. Felder wie im Backend (backend/app/main.py).

// Stichtag der Testdaten: alle Fristen („überfällig“, „ab heute“) beziehen sich auf diesen Tag.
export const HEUTE = "2026-11-02";

// Wer die App gerade nutzt (in der Vorschau fest, im Zielbild aus der Anmeldung).
export const ICH = "p1";

export type Kategorie = "profile" | "beschlaege" | "tueren" | "fassade";
export type MusterStand = "aktuell" | "veraltet";
export type ReservierungStatus = "geplant" | "aktiv" | "zurueck";
export type MeldungArt = "fehlt" | "veraltet";
export type MeldungStatus = "offen" | "erledigt";

export interface Person {
  id: string;
  name: string;
  gebiet: string;
}

export interface Muster {
  id: string;
  artikelnr: string; // SAP-Nummer aus dem PIM
  bezeichnung: string;
  stand: MusterStand;
}

export interface Koffer {
  id: string;
  nummer: string;
  name: string;
  kategorie: Kategorie;
  lagerort: string;
  inPruefung: boolean;
  geprueftAm: string;
  muster: Muster[];
}

export interface Reservierung {
  id: string;
  kofferId: string;
  personId: string;
  von: string;
  bis: string;
  zweck: string;
  status: ReservierungStatus;
  zurueckAm?: string;
}

export interface Meldung {
  id: string;
  kofferId: string;
  musterId: string;
  art: MeldungArt;
  personId: string;
  datum: string;
  status: MeldungStatus;
}

export const PERSONEN: Person[] = [
  { id: "p1", name: "Lena Vogt", gebiet: "Nord" },
  { id: "p2", name: "Timo Kessler", gebiet: "Süd" },
  { id: "p3", name: "Aylin Demir", gebiet: "West" },
  { id: "p4", name: "Felix Hartung", gebiet: "Ost" },
  { id: "p5", name: "Sophie Brenner", gebiet: "Mitte" },
];

export const KOFFER: Koffer[] = [
  {
    id: "mk-01",
    nummer: "MK-01",
    name: "Profilserie 70 Fenster",
    kategorie: "profile",
    lagerort: "Werk 1 · Musterlager A3",
    inPruefung: false,
    geprueftAm: "2026-09-15",
    muster: [
      { id: "mk-01-1", artikelnr: "4100-7001", bezeichnung: "Blendrahmen 70 mm, Eckschnitt", stand: "aktuell" },
      { id: "mk-01-2", artikelnr: "4100-7012", bezeichnung: "Flügelprofil 70 mm, Eckschnitt", stand: "aktuell" },
      { id: "mk-01-3", artikelnr: "4100-7030", bezeichnung: "Mitteldichtung EPDM, 30 cm", stand: "veraltet" },
      { id: "mk-01-4", artikelnr: "4100-7045", bezeichnung: "Glasleiste eckig, 20 cm", stand: "aktuell" },
    ],
  },
  {
    id: "mk-02",
    nummer: "MK-02",
    name: "Profilserie 70 Fenster (2. Satz)",
    kategorie: "profile",
    lagerort: "Werk 1 · Musterlager A3",
    inPruefung: false,
    geprueftAm: "2026-10-01",
    muster: [
      { id: "mk-02-1", artikelnr: "4100-7001", bezeichnung: "Blendrahmen 70 mm, Eckschnitt", stand: "aktuell" },
      { id: "mk-02-2", artikelnr: "4100-7012", bezeichnung: "Flügelprofil 70 mm, Eckschnitt", stand: "aktuell" },
      { id: "mk-02-3", artikelnr: "4100-7031", bezeichnung: "Mitteldichtung EPDM neu, 30 cm", stand: "aktuell" },
    ],
  },
  {
    id: "mk-03",
    nummer: "MK-03",
    name: "Dreh-Kipp-Beschlag B-12",
    kategorie: "beschlaege",
    lagerort: "Werk 1 · Musterlager B1",
    inPruefung: false,
    geprueftAm: "2026-08-20",
    muster: [
      { id: "mk-03-1", artikelnr: "5200-1201", bezeichnung: "Ecklager B-12, silber", stand: "aktuell" },
      { id: "mk-03-2", artikelnr: "5200-1215", bezeichnung: "Getriebe B-12, Dornmaß 15", stand: "aktuell" },
      { id: "mk-03-3", artikelnr: "5200-1240", bezeichnung: "Fenstergriff Q, weiß", stand: "aktuell" },
      { id: "mk-03-4", artikelnr: "5200-1250", bezeichnung: "Pilzkopfzapfen, 5 Stück", stand: "aktuell" },
    ],
  },
  {
    id: "mk-04",
    nummer: "MK-04",
    name: "Haustür T60 Schwellen und Dichtungen",
    kategorie: "tueren",
    lagerort: "Werk 2 · Ausstellung",
    inPruefung: false,
    geprueftAm: "2026-07-02",
    muster: [
      { id: "mk-04-1", artikelnr: "6300-6001", bezeichnung: "Bodenschwelle 20 mm, alt", stand: "veraltet" },
      { id: "mk-04-2", artikelnr: "6300-6010", bezeichnung: "Türdichtung umlaufend, 40 cm", stand: "aktuell" },
      { id: "mk-04-3", artikelnr: "6300-6022", bezeichnung: "Mehrfachverriegelung, Ausschnitt", stand: "aktuell" },
    ],
  },
  {
    id: "mk-05",
    nummer: "MK-05",
    name: "Fassade F50 Pfosten-Riegel",
    kategorie: "fassade",
    lagerort: "Werk 2 · Musterlager C2",
    inPruefung: false,
    geprueftAm: "2026-10-10",
    muster: [
      { id: "mk-05-1", artikelnr: "7400-5001", bezeichnung: "Pfostenprofil 50 mm, 25 cm", stand: "aktuell" },
      { id: "mk-05-2", artikelnr: "7400-5008", bezeichnung: "Riegelverbinder T-Stoß", stand: "aktuell" },
      { id: "mk-05-3", artikelnr: "7400-5020", bezeichnung: "Andruckleiste mit Deckschale", stand: "aktuell" },
    ],
  },
  {
    id: "mk-06",
    nummer: "MK-06",
    name: "Hebe-Schiebetür S80 Laufwerke",
    kategorie: "tueren",
    lagerort: "Werk 2 · Musterlager C4",
    inPruefung: false,
    geprueftAm: "2026-10-12",
    muster: [
      { id: "mk-06-1", artikelnr: "6800-8001", bezeichnung: "Laufwagen 200 kg", stand: "aktuell" },
      { id: "mk-06-2", artikelnr: "6800-8014", bezeichnung: "Laufschiene, 30 cm", stand: "aktuell" },
      { id: "mk-06-3", artikelnr: "6800-8030", bezeichnung: "Hebe-Schiebe-Griff, edelstahl", stand: "aktuell" },
    ],
  },
  {
    id: "mk-07",
    nummer: "MK-07",
    name: "Sicherheitsbeschlag RC2",
    kategorie: "beschlaege",
    lagerort: "Werk 1 · Musterlager B2",
    inPruefung: false,
    geprueftAm: "2026-09-28",
    muster: [
      { id: "mk-07-1", artikelnr: "5200-2101", bezeichnung: "Sicherheitsschließteil RC2", stand: "aktuell" },
      { id: "mk-07-2", artikelnr: "5200-2110", bezeichnung: "Abschließbarer Griff, Schlüssel", stand: "aktuell" },
      { id: "mk-07-3", artikelnr: "5200-2120", bezeichnung: "Aufbohrschutz, Ausschnitt", stand: "aktuell" },
    ],
  },
  {
    id: "mk-08",
    nummer: "MK-08",
    name: "Profilserie 82 Passivhaus",
    kategorie: "profile",
    lagerort: "Werk 1 · Musterlager A4",
    inPruefung: true,
    geprueftAm: "2026-05-04",
    muster: [
      { id: "mk-08-1", artikelnr: "4100-8201", bezeichnung: "Blendrahmen 82 mm, Eckschnitt", stand: "aktuell" },
      { id: "mk-08-2", artikelnr: "4100-8210", bezeichnung: "Flügelprofil 82 mm, Eckschnitt", stand: "veraltet" },
      { id: "mk-08-3", artikelnr: "4100-8240", bezeichnung: "Dreifachverglasung, Ausschnitt", stand: "aktuell" },
    ],
  },
];

export const RESERVIERUNGEN: Reservierung[] = [
  { id: "r1", kofferId: "mk-01", personId: "p2", von: "2026-10-20", bis: "2026-11-06", zweck: "Verarbeitertag Süd", status: "aktiv" },
  { id: "r2", kofferId: "mk-03", personId: "p1", von: "2026-10-27", bis: "2026-11-04", zweck: "Termine Metallbau Region Nord", status: "aktiv" },
  { id: "r3", kofferId: "mk-04", personId: "p3", von: "2026-10-12", bis: "2026-10-30", zweck: "Bauträger-Gespräche West", status: "aktiv" },
  { id: "r4", kofferId: "mk-05", personId: "p4", von: "2026-10-28", bis: "2026-11-13", zweck: "Objektberatung Ost", status: "aktiv" },
  { id: "r5", kofferId: "mk-01", personId: "p5", von: "2026-11-09", bis: "2026-11-20", zweck: "Händlerschulung Mitte", status: "geplant" },
  { id: "r6", kofferId: "mk-02", personId: "p1", von: "2026-11-10", bis: "2026-11-14", zweck: "Fensterbauer Nord", status: "geplant" },
  { id: "r7", kofferId: "mk-07", personId: "p3", von: "2026-11-03", bis: "2026-11-07", zweck: "Sicherheitstag West", status: "geplant" },
  { id: "r8", kofferId: "mk-06", personId: "p2", von: "2026-10-01", bis: "2026-10-10", zweck: "Messe Süd", status: "zurueck", zurueckAm: "2026-10-10" },
];

export const MELDUNGEN: Meldung[] = [
  { id: "m1", kofferId: "mk-03", musterId: "mk-03-4", art: "fehlt", personId: "p1", datum: "2026-10-30", status: "offen" },
  { id: "m2", kofferId: "mk-04", musterId: "mk-04-1", art: "veraltet", personId: "p3", datum: "2026-10-25", status: "offen" },
  { id: "m3", kofferId: "mk-06", musterId: "mk-06-2", art: "fehlt", personId: "p2", datum: "2026-10-11", status: "erledigt" },
];
