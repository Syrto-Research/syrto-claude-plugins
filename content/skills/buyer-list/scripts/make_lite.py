#!/usr/bin/env python3
"""Strumento per i maintainer, non un passo della skill: eseguirlo dopo aver sostituito
references/aifi_financial_players.csv con un export AIFI aggiornato.

1. Nel CSV completo tiene solo le colonne a livello di fondo elencate in FULL_COLS (allowlist):
   il plugin e' pubblico, quindi nessun nominativo o recapito personale arriva nei file
   distribuiti, anche se AIFI aggiunge nuove colonne.
2. Riscrive references/aifi_funds_lite.csv: tutte le righe, solo le colonne di screening.
   La lite si legge per intero a ogni run; il CSV completo (con remarks) solo per la shortlist.
Uso: python3 scripts/make_lite.py
"""
import csv
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
SRC = HERE / "references" / "aifi_financial_players.csv"
DST = HERE / "references" / "aifi_funds_lite.csv"
FULL_COLS = [
    "name", "type", "citta", "nazione", "sito_web", "num_executives", "num_fondi",
    "totale_aum_eur", "aum_raw", "num_portfolio", "check_min_eur", "check_max_eur",
    "preferenze_geo", "focus_investimento", "preferenze_settore", "remarks",
]
LITE_COLS = [
    "name", "type", "focus_investimento", "check_min_eur", "check_max_eur",
    "preferenze_settore", "preferenze_geo", "totale_aum_eur", "sito_web",
]


def write(path: Path, cols: list[str], rows: list[dict[str, str]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f, lineterminator="\n")
        w.writerow(cols)
        w.writerows([r.get(c, "") for c in cols] for r in rows)


def main() -> int:
    # utf-8-sig: un export da Excel inizia con un BOM che altrimenti rinomina "name".
    with SRC.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.DictReader(f)
        header = list(reader.fieldnames or [])
        rows = list(reader)
    missing = [c for c in FULL_COLS if c not in header]
    if missing:
        # Una colonna rinominata diventerebbe altrimenti una colonna vuota in entrambi i file.
        print(f"Colonne mancanti nell'export AIFI: {missing}", file=sys.stderr)
        return 1
    dropped = [c for c in header if c not in FULL_COLS]
    write(SRC, FULL_COLS, rows)
    write(DST, LITE_COLS, rows)
    print(f"{len(rows)} righe -> {DST.name}; colonne escluse da {SRC.name}: {dropped}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
