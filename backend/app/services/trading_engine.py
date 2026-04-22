from __future__ import annotations

from dataclasses import asdict

from fastapi import HTTPException, status

from app.schemas.trading import BrokerageBreakdown, OrderRequest, TradingMode
from app.services.angel_client import AngelSmartApiClient
from app.services.session_store import SessionState, session_store


def calculate_intraday_brokerage(buy_price: float, sell_price: float, quantity: int) -> BrokerageBreakdown:
    buy_value = buy_price * quantity
    sell_value = sell_price * quantity
    turnover = buy_value + sell_value
    gross_pnl = sell_value - buy_value

    # Brokerage is charged per executed side: lower of Rs 20 or 0.03% of each side value.
    brokerage_buy = min(20.0, buy_value * 0.0003)
    brokerage_sell = min(20.0, sell_value * 0.0003)
    brokerage = brokerage_buy + brokerage_sell

    stt = sell_value * 0.00025
    exchange_txn_charges = turnover * 0.0000325
    gst = 0.18 * (brokerage + exchange_txn_charges)
    sebi_charges = turnover * 0.000001
    stamp_duty = buy_value * 0.00003

    total_charges = brokerage + stt + exchange_txn_charges + gst + sebi_charges + stamp_duty
    net_pnl = gross_pnl - total_charges

    return BrokerageBreakdown(
        turnover=round(turnover, 2),
        gross_pnl=round(gross_pnl, 2),
        brokerage=round(brokerage, 2),
        stt=round(stt, 2),
        exchange_txn_charges=round(exchange_txn_charges, 2),
        gst=round(gst, 2),
        sebi_charges=round(sebi_charges, 2),
        stamp_duty=round(stamp_duty, 2),
        total_charges=round(total_charges, 2),
        net_pnl=round(net_pnl, 2),
    )


def _extract_bid_ask(quote_payload: dict) -> tuple[float, float]:
    best_buy = quote_payload.get("best5buy", [])
    best_sell = quote_payload.get("best5sell", [])

    if best_buy and best_sell:
        bid = float(best_buy[0].get("price") or quote_payload.get("ltp"))
        ask = float(best_sell[0].get("price") or quote_payload.get("ltp"))
    else:
        ltp = quote_payload.get("ltp")
        if ltp is None:
            raise HTTPException(status_code=400, detail="Quote missing LTP for paper fill")
        bid = float(ltp)
        ask = float(ltp)

    return bid, ask


async def create_session(mode: TradingMode, credentials, virtual_capital: float | None) -> SessionState:
    client = AngelSmartApiClient(api_key=credentials.api_key)
    login_data = await client.login(credentials.client_id, credentials.pin, credentials.totp_secret)

    jwt_token = login_data.get("jwtToken")
    refresh_token = login_data.get("refreshToken")
    feed_token = login_data.get("feedToken")
    if not jwt_token or not refresh_token or not feed_token:
        raise HTTPException(status_code=400, detail="Invalid broker login payload")

    user_name = login_data.get("name")

    authed_client = AngelSmartApiClient(api_key=credentials.api_key, access_token=jwt_token)

    available_capital = 0.0
    virtual = None
    if mode == TradingMode.LIVE:
        rms = await authed_client.get_rms()
        available_capital = float(rms.get("availablecash") or rms.get("net") or 0)
    else:
        if virtual_capital is None or virtual_capital <= 0:
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="virtual_capital is required in paper mode")
        available_capital = float(virtual_capital)
        virtual = float(virtual_capital)

    state = SessionState(
        session_id=session_store.new_session_id(),
        mode=mode,
        jwt_token=jwt_token,
        refresh_token=refresh_token,
        feed_token=feed_token,
        api_key=credentials.api_key,
        client_id=credentials.client_id,
        broker_user_name=user_name,
        available_capital=available_capital,
        virtual_capital=virtual,
    )
    return session_store.create(state)


async def execute_order(payload: OrderRequest) -> dict:
    state = session_store.get(payload.session_id)
    client = AngelSmartApiClient(api_key=state.api_key, access_token=state.jwt_token)

    scrip = await client.search_scrip(payload.exchange, payload.strategy.symbol)
    symbol_token = str(scrip.get("symboltoken") or scrip.get("token"))
    tradingsymbol = scrip.get("tradingsymbol") or payload.strategy.symbol

    quote = await client.get_quote_full(payload.exchange, symbol_token)
    bid, ask = _extract_bid_ask(quote)

    quantity = payload.strategy.quantity
    side = payload.side.upper()

    if state.mode == TradingMode.LIVE:
        broker_order = await client.place_intraday_order(
            client_id=state.client_id,
            exchange=payload.exchange,
            symbol=tradingsymbol,
            symbol_token=symbol_token,
            quantity=quantity,
            side=side,
        )
        fill_price = ask if side == "BUY" else bid
        order_id = str(broker_order.get("orderid") or "UNKNOWN")
        broker_status = "placed"
        capital_after = state.available_capital
    else:
        fill_price = ask if side == "BUY" else bid
        gross_value = fill_price * quantity
        if side == "BUY":
            capital_after = state.available_capital - gross_value
        else:
            capital_after = state.available_capital + gross_value

        if capital_after < 0:
            raise HTTPException(status_code=400, detail="Insufficient virtual capital")

        session_store.update_capital(state.session_id, capital_after)
        order_id = f"PAPER-{len(state.orders) + 1}"
        broker_status = "simulated"

    gross_value = round(fill_price * quantity, 2)
    order_record = {
        "mode": state.mode.value,
        "symbol": tradingsymbol,
        "quantity": quantity,
        "side": side,
        "fill_price": round(fill_price, 2),
        "gross_value": gross_value,
        "order_id": order_id,
        "broker_status": broker_status,
        "capital_after_trade": round(capital_after, 2),
    }
    session_store.append_order(state.session_id, order_record)
    return order_record
