from fastapi import APIRouter, HTTPException

from app.schemas.trading import (
    BrokerageRequest,
    CapitalResponse,
    OrderRequest,
    OrderResponse,
    SessionInitRequest,
    SessionInitResponse,
)
from app.services.session_store import session_store
from app.services.trading_engine import calculate_intraday_brokerage, create_session, execute_order

router = APIRouter(prefix="/api/v1", tags=["trading"])


@router.post("/session/connect", response_model=SessionInitResponse)
async def connect_session(payload: SessionInitRequest) -> SessionInitResponse:
    state = await create_session(payload.mode, payload.credentials, payload.virtual_capital)
    return SessionInitResponse(
        session_id=state.session_id,
        mode=state.mode,
        available_capital=round(state.available_capital, 2),
        broker_user_name=state.broker_user_name,
    )


@router.get("/session/{session_id}/capital", response_model=CapitalResponse)
async def get_capital(session_id: str) -> CapitalResponse:
    try:
        state = session_store.get(session_id)
    except KeyError as exc:
        raise HTTPException(status_code=404, detail="Session not found") from exc

    return CapitalResponse(
        session_id=state.session_id,
        mode=state.mode,
        available_capital=round(state.available_capital, 2),
    )


@router.post("/orders/execute", response_model=OrderResponse)
async def place_order(payload: OrderRequest) -> OrderResponse:
    data = await execute_order(payload)
    return OrderResponse(**data)


@router.post("/brokerage/calculate")
async def brokerage_calculator(payload: BrokerageRequest):
    return calculate_intraday_brokerage(payload.buy_price, payload.sell_price, payload.quantity)
