import glob
import os
from datetime import datetime, timezone

import pandas as pd
import requests

import config
from modules.classifier import AGE_LABELS_PL, AGE_COLORS


class DiscordSender:
    def __init__(self, webhook_url=None):
        self.webhook_url = webhook_url or config.DISCORD_WEBHOOK

    def send_offers(self, offers):
        if not self.webhook_url or not offers:
            return
        batch = []
        for offer in offers[:8]:
            age_group = offer.get("age_group", "")
            color = AGE_COLORS.get(age_group, 0x00B8D4)

            name = offer.get("name", "")
            person_type = offer.get("person_type", "")
            timeline = offer.get("timeline", "")

            fields = [
                {"name": "ID", "value": str(offer.get("id", "")), "inline": True},
                {"name": "Data", "value": offer.get("date", ""), "inline": True},
                {"name": "Lokalizacja", "value": offer.get("city", "?"), "inline": True},
                {"name": "Metraz", "value": offer.get("metrage", "?"), "inline": True},
            ]
            if name:
                fields.append({"name": "Kontakt", "value": name, "inline": True})
            if person_type:
                pl_type = "Prywatny" if "prywat" in person_type.lower() else "Firma"
                fields.append({"name": "Typ", "value": pl_type, "inline": True})
            if timeline:
                fields.append({"name": "Termin", "value": timeline, "inline": True})
            if offer.get("price"):
                fields.append({"name": "Cena", "value": offer["price"], "inline": True})
            if offer.get("source"):
                fields.append({"name": "Zrodlo", "value": offer["source"], "inline": True})
            if age_group:
                fields.append({"name": "Wiek", "value": AGE_LABELS_PL.get(age_group, age_group), "inline": True})

            embed = {
                "title": (offer.get("title", "Bez tytulu")[:200]),
                "url": offer.get("url", ""),
                "description": (offer.get("snippet", "")[:400] if offer.get("snippet") else ""),
                "color": color,
                "fields": fields,
                "footer": {"text": f"Podlogi Hunter v4 auton. | {offer.get('query', '')}"},
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
            batch.append(embed)

        if batch:
            data = {
                "username": "Podlogi Hunter",
                "content": f"**\\U0001f6a8 {len(batch)} nowych zlecen!**",
                "embeds": batch,
            }
            try:
                requests.post(self.webhook_url, json=data, timeout=10)
            except Exception:
                pass

    def send_report(self, report_text):
        if not self.webhook_url:
            return
        data = {
            "username": "Podlogi Hunter",
            "content": report_text[:2000],
        }
        try:
            requests.post(self.webhook_url, json=data, timeout=10)
        except Exception:
            pass


class ExcelExporter:
    def __init__(self, max_files=None):
        self.max_files = max_files or config.MAX_EXCEL_FILES

    def save(self, offers, prefix="zlecenia_podlogi"):
        if not offers:
            return None
        enriched = []
        for o in offers:
            enriched.append({
                "ID": o.get("id", ""),
                "Data": o.get("date", ""),
                "Tytul": o.get("title", ""),
                "Miasto": o.get("city", ""),
                "Metraz": o.get("metrage", ""),
                "Cena": o.get("price", ""),
                "Kontakt": o.get("name", ""),
                "Typ": o.get("person_type", ""),
                "Termin": o.get("timeline", ""),
                "Zrodlo": o.get("source", ""),
                "Grupa": AGE_LABELS_PL.get(o.get("age_group", ""), o.get("age_group", "")),
                "Zapytanie": o.get("query", ""),
            })
        df = pd.DataFrame(enriched)
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{prefix}_{timestamp}.xlsx"
        df.to_excel(filename, index=False)
        self._cleanup(prefix)
        return filename

    def _cleanup(self, prefix):
        files = sorted(glob.glob(f"{prefix}_*.xlsx"))
        while len(files) > self.max_files:
            os.remove(files[0])
            files = files[1:]
