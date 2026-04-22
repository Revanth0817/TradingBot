"use client";

import { useState } from "react";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useTradingStore } from "@/store/trading-store";

export function SettingsModal() {
  const [apiKey, setApiKey] = useState("");
  const [clientId, setClientId] = useState("");
  const [pin, setPin] = useState("");
  const [totp, setTotp] = useState("");

  const setCredentials = useTradingStore((s) => s.setCredentials);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" className="gap-2">
          <Settings2 className="h-4 w-4" /> API Settings
        </Button>
      </DialogTrigger>
      <DialogContent>
        <h2 className="text-lg font-semibold">Angel One Credentials</h2>
        <p className="mt-1 text-sm text-muted">
          Credentials stay in runtime state and are never hardcoded.
        </p>
        <div className="mt-4 space-y-3">
          <Input placeholder="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          <Input placeholder="Client ID" value={clientId} onChange={(e) => setClientId(e.target.value)} />
          <Input
            placeholder="Client PIN"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <Input
            placeholder="TOTP Secret"
            type="password"
            value={totp}
            onChange={(e) => setTotp(e.target.value)}
          />
        </div>
        <Button
          className="mt-4 w-full"
          onClick={() =>
            setCredentials({
              api_key: apiKey,
              client_id: clientId,
              pin,
              totp_secret: totp,
            })
          }
        >
          Save Credentials
        </Button>
      </DialogContent>
    </Dialog>
  );
}
