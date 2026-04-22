"use client";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTradingStore } from "@/store/trading-store";

const optionClass = "h-10 rounded-lg border border-line bg-panelAlt px-2 text-sm text-text";

export function StrategyPanel() {
  const rows = useTradingStore((s) => s.strategyRows);
  const update = useTradingStore((s) => s.updateStrategyRow);
  const add = useTradingStore((s) => s.addStrategyRow);
  const execute = useTradingStore((s) => s.executeStrategyOrder);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold">Scalping Strategy (Intraday)</h3>
        <Button variant="secondary" onClick={add} className="gap-1">
          <Plus className="h-4 w-4" /> Add Stock
        </Button>
      </div>

      <div className="space-y-4">
        {rows.map((row, idx) => (
          <div key={`${idx}-${row.symbol}`} className="grid gap-2 rounded-xl border border-line p-3 lg:grid-cols-6">
            <Input
              value={row.symbol}
              onChange={(e) => update(idx, { symbol: e.target.value.toUpperCase() })}
              placeholder="Ticker"
            />
            <Input
              type="number"
              value={row.quantity}
              onChange={(e) => update(idx, { quantity: Number(e.target.value) })}
              placeholder="Qty"
            />

            <div className="flex gap-2">
              <select
                className={optionClass}
                value={row.targetType}
                onChange={(e) => update(idx, { targetType: e.target.value as "points" | "percent" })}
              >
                <option value="points">Target Pts</option>
                <option value="percent">Target %</option>
              </select>
              <Input
                type="number"
                step="0.1"
                value={row.targetValue}
                onChange={(e) => update(idx, { targetValue: Number(e.target.value) })}
              />
            </div>

            <div className="flex gap-2">
              <select
                className={optionClass}
                value={row.stopType}
                onChange={(e) => update(idx, { stopType: e.target.value as "points" | "percent" })}
              >
                <option value="points">SL Pts</option>
                <option value="percent">SL %</option>
              </select>
              <Input
                type="number"
                step="0.1"
                value={row.stopValue}
                onChange={(e) => update(idx, { stopValue: Number(e.target.value) })}
              />
            </div>

            <Button onClick={() => execute(idx, "BUY")}>BUY</Button>
            <Button variant="danger" onClick={() => execute(idx, "SELL")}>SELL</Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
