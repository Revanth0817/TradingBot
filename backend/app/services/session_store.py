from dataclasses import dataclass, field
from threading import Lock
from typing import Optional
from uuid import uuid4

from app.schemas.trading import TradingMode


@dataclass
class SessionState:
    session_id: str
    mode: TradingMode
    jwt_token: str
    refresh_token: str
    feed_token: str
    api_key: str
    client_id: str
    broker_user_name: Optional[str]
    available_capital: float
    virtual_capital: Optional[float] = None
    orders: list[dict] = field(default_factory=list)


class InMemorySessionStore:
    def __init__(self) -> None:
        self._items: dict[str, SessionState] = {}
        self._lock = Lock()

    def create(self, payload: SessionState) -> SessionState:
        with self._lock:
            self._items[payload.session_id] = payload
            return payload

    def new_session_id(self) -> str:
        return str(uuid4())

    def get(self, session_id: str) -> SessionState:
        with self._lock:
            if session_id not in self._items:
                raise KeyError("Invalid session id")
            return self._items[session_id]

    def update_capital(self, session_id: str, value: float) -> None:
        with self._lock:
            if session_id not in self._items:
                raise KeyError("Invalid session id")
            self._items[session_id].available_capital = value

    def append_order(self, session_id: str, order_data: dict) -> None:
        with self._lock:
            if session_id not in self._items:
                raise KeyError("Invalid session id")
            self._items[session_id].orders.append(order_data)


session_store = InMemorySessionStore()
