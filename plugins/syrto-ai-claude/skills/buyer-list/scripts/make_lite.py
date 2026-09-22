#!/usr/bin/env python3
"""Rigenera la tabella lite (solo colonne di screening, tutte le righe) dal CSV AIFI completo,
e toglie dal CSV completo le colonne con dati personali (referente, telefono, email).
Uso: python scripts/make_lite.py
La lite serve per essere letta INTEGRALMENTE a ogni run (tutte le 189 righe visibili, ~7-8k token),
mentre il CSV completo (con remarks) si consulta solo per la shortlist."""
import csv, os

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, "references", "aifi_financial_players.csv")
DST = os.path.join(HERE, "references", "aifi_funds_lite.csv")
LITE_COLS = ["name","type","focus_investimento","check_min_eur","check_max_eur",
             "preferenze_settore","preferenze_geo","totale_aum_eur","sito_web"]
# Il plugin e' pubblico: nessun nominativo o recapito personale nei file distribuiti.
PERSONAL_COLS = ["referente", "telefono", "email"]

def main():
    with open(SRC, encoding="utf-8") as f:
        reader = csv.DictReader(f)
        full_cols = [c for c in reader.fieldnames if c not in PERSONAL_COLS]
        rows = list(reader)
    with open(SRC, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(full_cols)
        for r in rows:
            w.writerow([r.get(c, "") for c in full_cols])
    with open(DST, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(LITE_COLS)
        for r in rows:
            w.writerow([r.get(c, "") for c in LITE_COLS])
    print(f"Scritte {len(rows)} righe -> {DST}; tolte {PERSONAL_COLS} da {SRC}")

if __name__ == "__main__":
    main()
