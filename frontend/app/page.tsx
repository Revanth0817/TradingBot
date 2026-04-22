"use client";

import { useMemo } from "react";
import { Activity, CircleDollarSign, RefreshCcw } from "lucide-react";

import { BrokerageWidget } from "@/components/trading/brokerage-widget";
import { SettingsModal } from "@/components/trading/settings-modal";
import { StrategyPanel } from "@/components/trading/strategy-panel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useTradingStore } from "@/store/trading-store";

export default function HomePage() {
  const mode = useTradingStore((s) => s.mode);
  const setMode = useTradingStore((s) => s.setMode);
  const virtualCapital = useTradingStore((s) => s.virtualCapital);
  const setVirtualCapital = useTradingStore((s) => s.setVirtualCapital);
  const availableCapital = useTradingStore((s) => s.availableCapital);
  const connectBroker = useTradingStore((s) => s.connectBroker);
  const refreshCapital = useTradingStore((s) => s.refreshCapital);
  const isLoading = useTradingStore((s) => s.isLoading);
  const lastOrder = useTradingStore((s) => s.lastOrder);
  const error = useTradingStore((s) => s.error);
  const brokerUserName = useTradingStore((s) => s.brokerUserName);

  const modeLabel = useMemo(() => (mode === "paper" ? "Paper Trading" : "Live Trading"), [mode]);

  return (
    <main className="grid-overlay min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <section className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-3 rounded-2xl border border-line bg-panel/90 p-4 shadow-soft backdrop-blur sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold">Angel One Algo Desk</h1>
            <p className="text-sm text-muted">Intraday scalping control center</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-line bg-panelAlt px-3 py-2">
              <span className="text-sm text-muted">Paper</span>
              <Switch checked={mode === "live"} onCheckedChange={(c) => setMode(c ? "live" : "paper")} />
              <span className="text-sm text-muted">Live</span>
            </div>
            <SettingsModal />
            <Button onClick={() => connectBroker()} disabled={isLoading}>
              Connect
            </Button>
          </div>
        </header>

        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">Mode</p>
                <p className="text-lg font-semibold">{modeLabel}</p>
              </div>
              <Activity className="h-6 w-6 text-accent" />
            </div>

            {mode === "paper" && (
              <div className="mt-4 max-w-sm">
                <p className="mb-2 text-sm text-muted">Virtual Starting Capital</p>
                <Input
                  type="number"
                  value={virtualCapital}
                  onChange={(e) => setVirtualCapital(Number(e.target.value))}
                />
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="rounded-lg border border-line bg-panelAlt px-3 py-2 text-sm">
                <p className="text-muted">Broker User</p>
                <p className="font-medium">{brokerUserName || "Not connected"}</p>
              </div>
              <div className="rounded-lg border border-line bg-panelAlt px-3 py-2 text-sm">
                <p className="text-muted">Available Capital</p>
                <p className="font-medium">{availableCapital.toFixed(2)}</p>
              </div>
              <Button variant="secondary" className="gap-2" onClick={() => refreshCapital()}>
                <RefreshCcw className="h-4 w-4" /> Refresh Capital
              </Button>
            </div>

            {error && <p className="mt-3 text-sm text-danger">{error}</p>}
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Last Execution</h2>
              <CircleDollarSign className="h-5 w-5 text-accent" />
            </div>
            {lastOrder ? (
              <div className="mt-3 space-y-2 text-sm">
                <p>
                  {lastOrder.side} {lastOrder.quantity} {lastOrder.symbol}
                </p>
                <p className="text-muted">Fill: {lastOrder.fill_price.toFixed(2)}</p>
                <p className="text-muted">Status: {lastOrder.broker_status}</p>
                <p className="text-muted">Order: {lastOrder.order_id}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted">No orders yet.</p>
            )}
          </Card>
        </div>

        <StrategyPanel />

        <BrokerageWidget />
      </section>
    </main>
  );
}
