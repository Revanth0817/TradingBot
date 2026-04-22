"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { calculateBrokerage } from "@/lib/api";

type Breakdown = {
  turnover: number;
  gross_pnl: number;
  brokerage: number;
  stt: number;
  exchange_txn_charges: number;
  gst: number;
  sebi_charges: number;
  stamp_duty: number;
  total_charges: number;
  net_pnl: number;
};

export function BrokerageWidget() {
  const [buyPrice, setBuyPrice] = useState(100);
  const [sellPrice, setSellPrice] = useState(101);
  const [qty, setQty] = useState(100);
  const [result, setResult] = useState<Breakdown | null>(null);
  const [error, setError] = useState("");

  const pnlColor = useMemo(() => {
    if (!result) return "text-text";
    return result.net_pnl >= 0 ? "text-accent" : "text-danger";
  }, [result]);

  return (
    <Card>
      <h3 className="text-base font-semibold">Intraday Brokerage Calculator</h3>
      <p className="mt-1 text-sm text-muted">Includes brokerage + all mandatory Indian charges.</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Input
          type="number"
          step="0.05"
          value={buyPrice}
          onChange={(e) => setBuyPrice(Number(e.target.value))}
          placeholder="Buy"
        />
        <Input
          type="number"
          step="0.05"
          value={sellPrice}
          onChange={(e) => setSellPrice(Number(e.target.value))}
          placeholder="Sell"
        />
        <Input type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} placeholder="Qty" />
      </div>

      <Button
        className="mt-4"
        onClick={async () => {
          setError("");
          try {
            const data = await calculateBrokerage({
              buy_price: buyPrice,
              sell_price: sellPrice,
              quantity: qty,
            });
            setResult(data);
          } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to calculate");
          }
        }}
      >
        Compute Net P/L
      </Button>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}

      {result && (
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Gross P/L</span>
            <span>{result.gross_pnl.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Total Charges</span>
            <span>{result.total_charges.toFixed(2)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-2 text-base font-semibold">
            <span>Net P/L</span>
            <span className={pnlColor}>{result.net_pnl.toFixed(2)}</span>
          </div>
        </div>
      )}
    </Card>
  );
}
