"""API der Musterkoffer-Ausleihe (Zielbild: Azure App Service). Läuft in der Live-Vorschau nicht mit;
das Frontend nutzt dort die Testdaten aus src/lib/demo-daten.ts. Felder wie dort.

Zielbild der Anbindungen (noch offen, siehe Bauauftrag):
- Koffer und Muster (Artikelnummern, Stand) aus der Produktdaten-API (PIM) über die SAP Integration Suite,
  kein direkter Datenbankzugriff auf SAP.
- Personen nur pseudonymisiert (ID aus Entra ID); Klarnamen löst das Frontend über die Anmeldung auf.
- Speicherung in Azure SQL. Hier vorerst im Speicher mit Testdaten.
"""

from datetime import date
from typing import Literal
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI(title="Lumora Musterkoffer")

Kategorie = Literal["profile", "beschlaege", "tueren", "fassade"]
ReservierungStatus = Literal["geplant", "aktiv", "zurueck"]
MeldungArt = Literal["fehlt", "veraltet"]
MeldungStatus = Literal["offen", "erledigt"]


class Person(BaseModel):
    id: str
    name: str
    gebiet: str


class Muster(BaseModel):
    id: str
    artikelnr: str
    bezeichnung: str
    stand: Literal["aktuell", "veraltet"]


class Koffer(BaseModel):
    id: str
    nummer: str
    name: str
    kategorie: Kategorie
    lagerort: str
    inPruefung: bool
    geprueftAm: str
    muster: list[Muster]


class Reservierung(BaseModel):
    id: str
    kofferId: str
    personId: str
    von: str
    bis: str
    zweck: str
    status: ReservierungStatus
    zurueckAm: str | None = None


class ReservierungNeu(BaseModel):
    kofferId: str
    personId: str
    von: str
    bis: str
    zweck: str = ""


class ReservierungAenderung(BaseModel):
    status: ReservierungStatus


class Meldung(BaseModel):
    id: str
    kofferId: str
    musterId: str
    art: MeldungArt
    personId: str
    datum: str
    status: MeldungStatus


class MeldungNeu(BaseModel):
    kofferId: str
    musterId: str
    art: MeldungArt
    personId: str


class MeldungAenderung(BaseModel):
    status: MeldungStatus


# ---- Testdaten (Auszug, erfunden) ----

PERSONEN = [
    Person(id="p1", name="Lena Vogt", gebiet="Nord"),
    Person(id="p2", name="Timo Kessler", gebiet="Süd"),
    Person(id="p3", name="Aylin Demir", gebiet="West"),
]

KOFFER = [
    Koffer(
        id="mk-01", nummer="MK-01", name="Profilserie 70 Fenster", kategorie="profile",
        lagerort="Werk 1 · Musterlager A3", inPruefung=False, geprueftAm="2026-09-15",
        muster=[
            Muster(id="mk-01-1", artikelnr="4100-7001", bezeichnung="Blendrahmen 70 mm, Eckschnitt", stand="aktuell"),
            Muster(id="mk-01-3", artikelnr="4100-7030", bezeichnung="Mitteldichtung EPDM, 30 cm", stand="veraltet"),
        ],
    ),
    Koffer(
        id="mk-03", nummer="MK-03", name="Dreh-Kipp-Beschlag B-12", kategorie="beschlaege",
        lagerort="Werk 1 · Musterlager B1", inPruefung=False, geprueftAm="2026-08-20",
        muster=[
            Muster(id="mk-03-1", artikelnr="5200-1201", bezeichnung="Ecklager B-12, silber", stand="aktuell"),
            Muster(id="mk-03-4", artikelnr="5200-1250", bezeichnung="Pilzkopfzapfen, 5 Stück", stand="aktuell"),
        ],
    ),
]

RESERVIERUNGEN: list[Reservierung] = [
    Reservierung(id="r1", kofferId="mk-01", personId="p2", von="2026-10-20", bis="2026-11-06", zweck="Verarbeitertag Süd", status="aktiv"),
    Reservierung(id="r2", kofferId="mk-03", personId="p1", von="2026-10-27", bis="2026-11-04", zweck="Termine Metallbau Region Nord", status="aktiv"),
]

MELDUNGEN: list[Meldung] = [
    Meldung(id="m1", kofferId="mk-03", musterId="mk-03-4", art="fehlt", personId="p1", datum="2026-10-30", status="offen"),
]


def _koffer(koffer_id: str) -> Koffer:
    for k in KOFFER:
        if k.id == koffer_id:
            return k
    raise HTTPException(status_code=404, detail="Koffer nicht gefunden")


def _belegt(r: Reservierung, heute: str) -> tuple[str, str] | None:
    if r.status == "zurueck":
        return None
    if r.status == "aktiv":
        return (r.von, max(r.bis, heute))
    return (r.von, r.bis)


# ---- Endpunkte ----


@app.get("/api/gesund")
def gesund() -> dict:
    return {"ok": True}


@app.get("/api/personen")
def personen() -> list[Person]:
    return PERSONEN


@app.get("/api/koffer")
def koffer_liste() -> list[Koffer]:
    return KOFFER


@app.get("/api/koffer/{koffer_id}")
def koffer(koffer_id: str) -> Koffer:
    return _koffer(koffer_id)


@app.get("/api/reservierungen")
def reservierungen(kofferId: str | None = None, personId: str | None = None) -> list[Reservierung]:
    return [r for r in RESERVIERUNGEN if (kofferId is None or r.kofferId == kofferId) and (personId is None or r.personId == personId)]


@app.post("/api/reservierungen", status_code=201)
def reservieren(neu: ReservierungNeu) -> Reservierung:
    _koffer(neu.kofferId)
    heute = date.today().isoformat()
    if neu.von < heute:
        raise HTTPException(status_code=422, detail="Das Datum liegt in der Vergangenheit.")
    if neu.bis < neu.von:
        raise HTTPException(status_code=422, detail="Rückgabe muss am oder nach dem Abholtag liegen.")
    for r in RESERVIERUNGEN:
        b = _belegt(r, heute)
        if r.kofferId == neu.kofferId and b and neu.von <= b[1] and neu.bis >= b[0]:
            raise HTTPException(status_code=409, detail=f"Belegt vom {b[0]} bis {b[1]}.")
    r = Reservierung(id=f"r{uuid4().hex[:8]}", status="geplant", **neu.model_dump())
    RESERVIERUNGEN.append(r)
    return r


@app.patch("/api/reservierungen/{reservierung_id}")
def reservierung_aendern(reservierung_id: str, aenderung: ReservierungAenderung) -> Reservierung:
    for r in RESERVIERUNGEN:
        if r.id == reservierung_id:
            r.status = aenderung.status
            r.zurueckAm = date.today().isoformat() if aenderung.status == "zurueck" else None
            return r
    raise HTTPException(status_code=404, detail="Reservierung nicht gefunden")


@app.delete("/api/reservierungen/{reservierung_id}", status_code=204)
def stornieren(reservierung_id: str) -> None:
    for r in RESERVIERUNGEN:
        if r.id == reservierung_id:
            if r.status != "geplant":
                raise HTTPException(status_code=409, detail="Nur geplante Reservierungen lassen sich stornieren.")
            RESERVIERUNGEN.remove(r)
            return
    raise HTTPException(status_code=404, detail="Reservierung nicht gefunden")


@app.get("/api/meldungen")
def meldungen(status: MeldungStatus | None = None) -> list[Meldung]:
    return [m for m in MELDUNGEN if status is None or m.status == status]


@app.post("/api/meldungen", status_code=201)
def melden(neu: MeldungNeu) -> Meldung:
    k = _koffer(neu.kofferId)
    if not any(m.id == neu.musterId for m in k.muster):
        raise HTTPException(status_code=404, detail="Muster nicht im Koffer")
    m = Meldung(id=f"m{uuid4().hex[:8]}", datum=date.today().isoformat(), status="offen", **neu.model_dump())
    MELDUNGEN.insert(0, m)
    return m


@app.patch("/api/meldungen/{meldung_id}")
def meldung_aendern(meldung_id: str, aenderung: MeldungAenderung) -> Meldung:
    for m in MELDUNGEN:
        if m.id == meldung_id:
            m.status = aenderung.status
            return m
    raise HTTPException(status_code=404, detail="Meldung nicht gefunden")


@app.delete("/api/meldungen/{meldung_id}", status_code=204)
def meldung_zuruecknehmen(meldung_id: str) -> None:
    for m in MELDUNGEN:
        if m.id == meldung_id:
            MELDUNGEN.remove(m)
            return
    raise HTTPException(status_code=404, detail="Meldung nicht gefunden")
