from __future__ import annotations

import os
import secrets
from pathlib import Path

import msgspec
from reproca import create_starlette_application, generate_typescript_bindings, method
from reproca.sessions import Sessions
from starlette.requests import Request

from .db import Db
from .utils import now

os.chdir(Path(__file__).parent.parent.parent)


class User(msgspec.Struct):
    # put any additional fields you would like to store in sessions, they can be
    # accessed inside any method using the `session` parameter, if the user is
    # authenticated.
    additional_data: str


sessions = Sessions[User]()


@method
async def create_room(name: str, description: str) -> str | None:
    with Db() as db:
        name = name.strip()
        description = description.strip()
        if not (1 < len(name) <= 80):
            return None
        if len(description) > 120:
            return None

        code = secrets.token_urlsafe(6)

        db.insert("rooms").values(
            {
                "code": code,
                "name": name,
                "description": description,
                "created_at": now(),
            },
        ).execute()

        return code


class Confession(msgspec.Struct):
    id: int
    content: str
    created_at: str


class GetConfessionRoomResponse(msgspec.Struct):
    name: str
    description: str
    confessions: list[Confession]


@method
async def get_confession_room(code: str) -> GetConfessionRoomResponse | None:
    with Db() as db:
        # First, get the room details
        room_row = db(
            "SELECT name, description FROM rooms WHERE code = ?", [code]
        ).one()
        if room_row is None:
            return None

        # Then get the confessions for this room
        db(
            "SELECT id, content, created_at FROM confessions WHERE is_visible = 1 AND room = ?",
            [code],
        )
        confessions = [row.into_obj(Confession) for row in db.all()]

        return GetConfessionRoomResponse(
            name=room_row.name,
            description=room_row.description,
            confessions=confessions,
        )


class SubmitConfessionResponse(msgspec.Struct):
    id: int
    token: str


@method
async def submit_confession(
    request: Request, code: str, content: str, context: str
) -> SubmitConfessionResponse | None:
    with Db() as db:
        content = content.strip()
        if not (1 < len(content) < 500):
            return None
        row = db("SELECT * FROM rooms WHERE code = ?", [code]).one()
        if row is None:
            return None

        token = secrets.token_urlsafe(6)

        db.insert("confessions").values(
            {
                "token": token,
                "room": code,
                "content": content,
                "context": context,
                "ipaddress": request.client and request.client.host,
                "created_at": now(),
            }
        ).execute()

        id = db.lastrowid()

        if not id:
            return

        return SubmitConfessionResponse(id, token)


@method
async def revoke_confession(token: str) -> bool:
    with Db() as db:
        try:
            db("DELETE FROM confessions WHERE token = ?", [token])
            return True
        except Exception:
            return False


app = create_starlette_application(sessions, base="/confessionrooms/api/")


# --- TypeScript code generation on first server start ---
generate_typescript_bindings("../frontend/src/services/api.gen.ts")
