from datetime import UTC, datetime


def now() -> str:
    return datetime.now(tz=UTC).isoformat()
