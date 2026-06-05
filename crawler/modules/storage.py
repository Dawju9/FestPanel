import json
import os
from datetime import datetime, timezone

import config
from modules.classifier import classify_by_age


def _ensure_dir(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)


class SeenIdsManager:
    def __init__(self, path=None):
        self.path = path or config.SEEN_IDS_FILE

    def load(self):
        if os.path.exists(self.path):
            with open(self.path, "r", encoding="utf-8") as f:
                return set(json.load(f))
        return set()

    def save(self, ids):
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(list(ids), f, ensure_ascii=False, indent=2)

    def add(self, oid):
        ids = self.load()
        ids.add(oid)
        self.save(ids)


class SourcesManager:
    def __init__(self, path=None):
        self.path = path or config.SOURCES_FILE

    def load(self):
        if os.path.exists(self.path):
            with open(self.path, "r", encoding="utf-8") as f:
                return json.load(f)
        return []

    def save(self, sources):
        _ensure_dir(self.path)
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(sources, f, ensure_ascii=False, indent=2)

    def exists(self, url):
        return any(s["url"] == url for s in self.load())

    def add_if_new(self, entries):
        existing = self.load()
        added = []
        for e in entries:
            if not self.exists(e["url"]):
                existing.append(e)
                added.append(e)
        if added:
            self.save(existing)
        return added


class KeywordsManager:
    def __init__(self, path=None):
        self.path = path or config.KEYWORDS_FILE

    def load(self):
        if os.path.exists(self.path):
            with open(self.path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def save(self, kw):
        _ensure_dir(self.path)
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(kw, f, ensure_ascii=False, indent=2)


class OffersHistoryManager:
    def __init__(self, path=None):
        self.path = path or config.OFFERS_HISTORY_FILE

    def load(self):
        if os.path.exists(self.path):
            with open(self.path, "r", encoding="utf-8") as f:
                return json.load(f)
        return {}

    def save(self, history):
        _ensure_dir(self.path)
        with open(self.path, "w", encoding="utf-8") as f:
            json.dump(history, f, ensure_ascii=False, indent=2)

    def upsert(self, offer, age_group):
        now_iso = datetime.now(timezone.utc).isoformat()
        oid = str(offer["id"])
        history = self.load()

        if oid in history:
            entry = history[oid]
            entry["last_seen"] = now_iso
            if entry["age_group"] != age_group:
                entry["age_group"] = age_group
                entry["status_history"].append({
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "group": age_group,
                })
        else:
            history[oid] = {
                "id": oid,
                "title": offer.get("title", ""),
                "date": offer.get("date", ""),
                "city": offer.get("city", ""),
                "metrage": offer.get("metrage", ""),
                "price": offer.get("price", ""),
                "source": offer.get("source", ""),
                "query": offer.get("query", ""),
                "url": offer.get("url", ""),
                "first_seen": now_iso,
                "last_seen": now_iso,
                "age_group": age_group,
                "status_history": [
                    {"date": datetime.now().strftime("%Y-%m-%d"), "group": age_group}
                ],
                "notified": False,
                "active": True,
            }

        self.save(history)

    def get_by_age_group(self, group):
        history = self.load()
        return {oid: entry for oid, entry in history.items()
                if entry.get("age_group") == group and entry.get("active", True)}

    def get_active(self):
        history = self.load()
        return {oid: entry for oid, entry in history.items()
                if entry.get("active", True)}

    def mark_notified(self, oid):
        history = self.load()
        if oid in history:
            history[oid]["notified"] = True
            self.save(history)

    def deactivate_old(self, max_days=None):
        if max_days is None:
            max_days = config.AGE_THRESHOLDS.get("old", 30)
        from datetime import date
        history = self.load()
        today = date.today()
        changed = 0
        for oid, entry in history.items():
            if not entry.get("active", True):
                continue
            d = entry.get("date", "")
            if not d:
                continue
            try:
                offer_date = datetime.strptime(d, "%Y-%m-%d").date()
            except ValueError:
                continue
            days_old = (today - offer_date).days
            if days_old > max_days:
                entry["active"] = False
                entry["age_group"] = "expired"
                entry["status_history"].append({
                    "date": today.isoformat(),
                    "group": "expired",
                })
                changed += 1
        if changed:
            self.save(history)
        return changed
