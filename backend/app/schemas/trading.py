from enum import Enum
from typing import Literal, Optional

from pydantic import BaseModel, Field, field_validator


class TradingMode(str, Enum):
    PAPER = "paper"
    LIVE = "live"


class TargetStopType(str, Enum):
    POINTS = "points"
    PERCENT = "percent"


class CredentialsInput(BaseModel):
    api_key: str = Field(min_length=3)
    client_id: str = Field(min_length=3)
    pin: str = Field(min_length=4)
    totp_secret: str = Field(min_length=8)


class SessionInitRequest(BaseModel):
    mode: TradingMode
    credentials: CredentialsInput
    virtual_capital: Optional[float] = None


class SessionInitResponse(BaseModel):
    session_id: str
    mode: TradingMode
    available_capital: float
    broker_user_name: Optional[str] = None


class TargetStopConfig(BaseModel):
    type: TargetStopType
    value: float = Field(gt=0)


class StrategyStockConfig(BaseModel):
    symbol: str = Field(min_length=1)
    quantity: int = Field(gt=0)
    target: TargetStopConfig
    stop_loss: TargetStopConfig

    @field_validator("symbol")
    @classmethod
    def normalize_symbol(cls, value: str) -> str:
        return value.upper().strip()


class OrderRequest(BaseModel):
    session_id: str
    side: Literal["BUY", "SELL"]
    exchange: str = "NSE"
    strategy: StrategyStockConfig


class OrderResponse(BaseModel):
    mode: TradingMode
    symbol: str
    quantity: int
    side: str
    fill_price: float
    gross_value: float
    order_id: str
    broker_status: str
    capital_after_trade: float


class BrokerageRequest(BaseModel):
    buy_price: float = Field(gt=0)
    sell_price: float = Field(gt=0)
    quantity: int = Field(gt=0)


class BrokerageBreakdown(BaseModel):
    turnover: float
    gross_pnl: float
    brokerage: float
    stt: float
    exchange_txn_charges: float
    gst: float
    sebi_charges: float
    stamp_duty: float
    total_charges: float
    net_pnl: float


class CapitalResponse(BaseModel):
    session_id: str
    mode: TradingMode
    available_capital: float
