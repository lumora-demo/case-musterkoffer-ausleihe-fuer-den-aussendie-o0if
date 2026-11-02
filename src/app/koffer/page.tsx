"use client";

import { ChevronRight, SearchX } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { KategorieLabel, standort, StatusBadge } from "@/components/koffer";
import { Button, EmptyState, Field, Input, PageHeader, Segmented, Werkzeugleiste } from "@/components/ui";
import { de } from "@/content/de";
import { aktiveAusleihe, kofferStatus, person, useAusleihe, type KofferStatus } from "@/lib/ausleihe";
import { KOFFER } from "@/lib/demo-daten";

const t = de.koffer;
type Filter = "alle" | "verfuegbar" | "unterwegs" | "pruefung";

export default function KofferListe() {
  const z = useAusleihe();
  const [filter, setFilter] = useState<Filter>("alle");
  const [suche, setSuche] = useState("");
  const q = suche.trim().toLowerCase();

  const liste = KOFFER.map((k) => ({ k, s: kofferStatus(z, k) as KofferStatus, ort: standort(z, k) })).filter(({ k, s }) => {
    if (filter === "unterwegs" && s !== "unterwegs" && s !== "ueberfaellig") return false;
    if (filter !== "alle" && filter !== "unterwegs" && s !== filter) return false;
    if (!q) return true;
    const p = person(aktiveAusleihe(z, k.id)?.personId ?? "");
    const text = [k.nummer, k.name, de.kategorie[k.kategorie], k.lagerort, p?.name ?? "", ...k.muster.map((m) => `${m.artikelnr} ${m.bezeichnung}`)];
    return text.join(" ").toLowerCase().includes(q);
  });

  const offen = (id: string) => z.meldungen.filter((m) => m.kofferId === id && m.status === "offen").length;

  return (
    <>
      <PageHeader title={t.title} lead={t.lead} />
      <Werkzeugleiste>
        <div className="w-full sm:w-80">
          <Field label={t.suche}>
            <Input type="search" value={suche} placeholder={t.sucheHinweis} onChange={(e) => setSuche(e.target.value)} />
          </Field>
        </div>
        <div className="max-w-full overflow-x-auto">
          <Segmented
            label={t.filter}
            wert={filter}
            setze={setFilter}
            werte={[
              { id: "alle", name: t.alle },
              { id: "verfuegbar", name: de.status.verfuegbar },
              { id: "unterwegs", name: de.status.unterwegs },
              { id: "pruefung", name: de.status.pruefung },
            ]}
          />
        </div>
      </Werkzeugleiste>

      {liste.length === 0 ? (
        <EmptyState icon={SearchX} title={t.leerTitel} text={t.leerText}>
          <Button
            onClick={() => {
              setSuche("");
              setFilter("alle");
            }}
          >
            {t.filterZuruecksetzen}
          </Button>
        </EmptyState>
      ) : (
        // Rechner: Zeilen in einer Fläche. Handy: dieselben Koffer als kompakte Karten.
        <ul className="flex flex-col gap-2 sm:gap-0 sm:overflow-hidden sm:rounded-card sm:bg-surface sm:shadow-card">
          {liste.map(({ k, s, ort }) => {
            const n = offen(k.id);
            return (
              <li key={k.id} className="sm:not-last:border-b sm:not-last:border-line">
                <Link
                  href={`/koffer/${k.id}/`}
                  className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card transition-colors duration-(--dur-fast) hover:bg-surface-2 sm:flex-row sm:items-center sm:gap-4 sm:rounded-none sm:px-(--pad-card) sm:py-3 sm:shadow-none"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-start justify-between gap-3">
                      <span className="min-w-0 font-medium">
                        <span className="font-mono text-small text-muted">{k.nummer}</span> {k.name}
                      </span>
                      <span className="sm:hidden">
                        <StatusBadge status={s} />
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                      <KategorieLabel k={k.kategorie} />
                      <span className="text-small text-muted">{t.muster(k.muster.length)}</span>
                      {n ? <span className="text-small font-medium text-warn">{t.gemeldet(n)}</span> : null}
                    </div>
                  </div>
                  <div className="flex flex-col sm:w-64">
                    <span className="text-small text-text-2">{ort.ort}</span>
                    {ort.zusatz ? <span className="text-small text-muted">{ort.zusatz}</span> : null}
                  </div>
                  <span className="w-24 max-sm:hidden">
                    <StatusBadge status={s} />
                  </span>
                  <ChevronRight className="size-4 text-muted max-sm:hidden" strokeWidth={1.75} aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
