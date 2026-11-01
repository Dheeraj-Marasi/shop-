"""
Python Backend Client for Activity Confirmation Email Service
Works with Django, Flask, FastAPI, or standalone Python scripts.

Usage:
    from client_sdk.python_client import ActivityNotifier

    notifier = ActivityNotifier(endpoint="http://localhost:3000/api/activity/notify")
    notifier.notify_login(
        user={"email": "alice@example.com", "name": "Alice"},
        ip="192.168.1.10",
        user_agent="Mozilla/5.0..."
    )
"""

import json
from datetime import datetime, timezone
from urllib import request, error

class ActivityNotifier:
    def __init__(self, endpoint="http://localhost:3000/api/activity/notify", api_key=None):
        self.endpoint = endpoint
        self.api_key = api_key

    def notify(self, payload: dict) -> dict:
        data = json.dumps(payload).encode("utf-8")
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "Python-ActivityNotifier/1.0"
        }
        if self.api_key:
            headers["x-api-key"] = self.api_key

        req = request.Request(self.endpoint, data=data, headers=headers, method="POST")
        try:
            with request.urlopen(req) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                return result
        except error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            raise RuntimeError(f"API Error {e.code}: {err_body}")
        except Exception as e:
            raise RuntimeError(f"Connection failed: {str(e)}")

    def notify_login(self, user: dict, ip: str = None, user_agent: str = None) -> dict:
        return self.notify({
            "user": user,
            "activity": {
                "type": "login",
                "title": "New Sign-In Detected",
                "ip": ip,
                "userAgent": user_agent,
                "timestamp": datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT")
            }
        })

    def notify_password_changed(self, user: dict, ip: str = None) -> dict:
        return self.notify({
            "user": user,
            "activity": {
                "type": "password_change",
                "title": "Password Changed",
                "ip": ip,
                "timestamp": datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT")
            }
        })

    def notify_profile_updated(self, user: dict, updated_fields: list) -> dict:
        return self.notify({
            "user": user,
            "activity": {
                "type": "profile_update",
                "title": "Profile Updated",
                "details": {"updatedFields": updated_fields},
                "timestamp": datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT")
            }
        })

    def notify_custom(self, user: dict, title: str, description: str, metadata: dict = None, action_url: str = None) -> dict:
        return self.notify({
            "user": user,
            "activity": {
                "type": "custom",
                "title": title,
                "description": description,
                "metadata": metadata or {},
                "actionUrl": action_url,
                "timestamp": datetime.now(timezone.utc).strftime("%a, %d %b %Y %H:%M:%S GMT")
            }
        })
