export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export type CredentialsInput = {
  api_key: string;
  client_id: string;
  pin: string;
  totp_secret: string;
};

export async function connectSession(payload: {
  mode: "paper" | "live";
  credentials: CredentialsInput;
  virtual_capital?: number;
}) {
  const res = await fetch(`${API_BASE_URL}/session/connect`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to connect session");
  }

  return res.json();
}

export async function fetchCapital(sessionId: string) {
  const res = await fetch(`${API_BASE_URL}/session/${sessionId}/capital`);
  if (!res.ok) {
    throw new Error("Failed to fetch capital");
  }
  return res.json();
}

export async function executeOrder(payload: {
  session_id: string;
  side: "BUY" | "SELL";
  exchange: string;
  strategy: {
    symbol: string;
    quantity: number;
    target: { type: "points" | "percent"; value: number };
    stop_loss: { type: "points" | "percent"; value: number };
  };
}) {
  const res = await fetch(`${API_BASE_URL}/orders/execute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Order execution failed");
  }

  return res.json();
}

export async function calculateBrokerage(payload: {
  buy_price: number;
  sell_price: number;
  quantity: number;
}) {
  const res = await fetch(`${API_BASE_URL}/brokerage/calculate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Brokerage calculation failed");
  }

  return res.json();
}
