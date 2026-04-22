from __future__ import annotations

from typing import Any

import httpx
import pyotp
from fastapi import HTTPException, status

from app.core.config import settings


class AngelSmartApiClient:
    def __init__(self, api_key: str, access_token: str | None = None) -> None:
        self.api_key = api_key
        self.access_token = access_token
        self.base_url = settings.angel_base_url.rstrip("/")

    def _headers(self, authenticated: bool = False) -> dict[str, str]:
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "X-PrivateKey": self.api_key,
            "X-UserType": "USER",
            "X-SourceID": "WEB",
        }
        if authenticated and self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        return headers

    async def _post(self, path: str, payload: dict[str, Any], authenticated: bool = False) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{self.base_url}{path}", json=payload, headers=self._headers(authenticated=authenticated)
            )
        return self._parse_response(response)

    async def _get(self, path: str) -> dict[str, Any]:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(f"{self.base_url}{path}", headers=self._headers(authenticated=True))
        return self._parse_response(response)

    @staticmethod
    def _parse_response(response: httpx.Response) -> dict[str, Any]:
        try:
            payload = response.json()
        except Exception as exc:
            raise HTTPException(status_code=502, detail=f"Broker response parse failed: {exc}") from exc

        if response.status_code >= 400:
            message = payload.get("message") if isinstance(payload, dict) else str(payload)
            raise HTTPException(status_code=502, detail=f"Broker error: {message}")

        if isinstance(payload, dict) and payload.get("status") is False:
            message = payload.get("message", "Unknown SmartAPI error")
            raise HTTPException(status_code=400, detail=message)

        return payload

    async def login(self, client_id: str, pin: str, totp_secret: str) -> dict[str, Any]:
        totp = pyotp.TOTP(totp_secret).now()
        body = {
            "clientcode": client_id,
            "password": pin,
            "totp": totp,
        }
        data = await self._post("/rest/auth/angelbroking/user/v1/loginByPassword", body)
        return data.get("data", {})

    async def get_rms(self) -> dict[str, Any]:
        data = await self._get("/rest/secure/angelbroking/user/v1/getRMS")
        return data.get("data", {})

    async def search_scrip(self, exchange: str, symbol: str) -> dict[str, Any]:
        body = {"exchange": exchange, "searchscrip": symbol}
        data = await self._post("/rest/secure/angelbroking/order/v1/searchScrip", body, authenticated=True)
        rows = data.get("data", [])
        if not rows:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"No token found for {symbol}")
        return rows[0]

    async def get_quote_full(self, exchange: str, symbol_token: str) -> dict[str, Any]:
        body = {"mode": "FULL", "exchangeTokens": {exchange: [symbol_token]}}
        data = await self._post("/rest/secure/angelbroking/market/v1/quote", body, authenticated=True)
        fetched = data.get("data", {}).get("fetched", [])
        if not fetched:
            raise HTTPException(status_code=404, detail="Unable to fetch quote data")
        return fetched[0]

    async def place_intraday_order(
        self,
        client_id: str,
        exchange: str,
        symbol: str,
        symbol_token: str,
        quantity: int,
        side: str,
    ) -> dict[str, Any]:
        order_payload = {
            "variety": "NORMAL",
            "tradingsymbol": symbol,
            "symboltoken": symbol_token,
            "transactiontype": side,
            "exchange": exchange,
            "ordertype": "MARKET",
            "producttype": "INTRADAY",
            "duration": "DAY",
            "price": "0",
            "squareoff": "0",
            "stoploss": "0",
            "quantity": str(quantity),
            "triggerprice": "0",
            "clientcode": client_id,
        }
        data = await self._post(
            "/rest/secure/angelbroking/order/v1/placeOrder", order_payload, authenticated=True
        )
        return data.get("data", {})
