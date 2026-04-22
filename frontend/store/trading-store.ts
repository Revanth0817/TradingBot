import { create } from "zustand";

import {
  connectSession,
  executeOrder,
  fetchCapital,
  type CredentialsInput,
} from "@/lib/api";

type Mode = "paper" | "live";
type TargetStopType = "points" | "percent";

export type StrategyRow = {
  symbol: string;
  quantity: number;
  targetType: TargetStopType;
  targetValue: number;
  stopType: TargetStopType;
  stopValue: number;
};

type LastOrder = {
  mode: Mode;
  symbol: string;
  quantity: number;
  side: "BUY" | "SELL";
  fill_price: number;
  gross_value: number;
  order_id: string;
  broker_status: string;
  capital_after_trade: number;
};

type TradingState = {
  mode: Mode;
  virtualCapital: number;
  availableCapital: number;
  sessionId: string;
  brokerUserName: string;
  credentials?: CredentialsInput;
  strategyRows: StrategyRow[];
  isLoading: boolean;
  lastOrder?: LastOrder;
  error?: string;
  setMode: (mode: Mode) => void;
  setVirtualCapital: (value: number) => void;
  setCredentials: (credentials: CredentialsInput) => void;
  connectBroker: () => Promise<void>;
  refreshCapital: () => Promise<void>;
  updateStrategyRow: (index: number, row: Partial<StrategyRow>) => void;
  addStrategyRow: () => void;
  executeStrategyOrder: (index: number, side: "BUY" | "SELL") => Promise<void>;
};

const defaultRow: StrategyRow = {
  symbol: "RELIANCE",
  quantity: 1,
  targetType: "points",
  targetValue: 2,
  stopType: "points",
  stopValue: 1,
};

const createDefaultRow = (): StrategyRow => ({ ...defaultRow });

export const useTradingStore = create<TradingState>((set, get) => ({
  mode: "paper",
  virtualCapital: 100000,
  availableCapital: 0,
  sessionId: "",
  brokerUserName: "",
  strategyRows: [createDefaultRow()],
  isLoading: false,
  setMode: (mode) => set({ mode }),
  setVirtualCapital: (value) => set({ virtualCapital: value }),
  setCredentials: (credentials) => set({ credentials }),

  connectBroker: async () => {
    const { mode, credentials, virtualCapital } = get();
    if (!credentials) {
      set({ error: "Enter API credentials in Settings" });
      return;
    }

    set({ isLoading: true, error: undefined });

    try {
      const response = await connectSession({
        mode,
        credentials,
        virtual_capital: mode === "paper" ? virtualCapital : undefined,
      });
      set({
        sessionId: response.session_id,
        availableCapital: response.available_capital,
        brokerUserName: response.broker_user_name || "",
        isLoading: false,
      });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : "Connection failed" });
    }
  },

  refreshCapital: async () => {
    const { sessionId } = get();
    if (!sessionId) return;

    try {
      const response = await fetchCapital(sessionId);
      set({ availableCapital: response.available_capital });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Unable to refresh capital" });
    }
  },

  addStrategyRow: () => {
    const rows = get().strategyRows;
    set({ strategyRows: [...rows, createDefaultRow()] });
  },

  updateStrategyRow: (index, row) => {
    const rows = [...get().strategyRows];
    rows[index] = { ...rows[index], ...row };
    set({ strategyRows: rows });
  },

  executeStrategyOrder: async (index, side) => {
    const { strategyRows, sessionId } = get();
    if (!sessionId) {
      set({ error: "Connect broker first" });
      return;
    }

    const row = strategyRows[index];
    set({ isLoading: true, error: undefined });

    try {
      const result = await executeOrder({
        session_id: sessionId,
        side,
        exchange: "NSE",
        strategy: {
          symbol: row.symbol,
          quantity: row.quantity,
          target: { type: row.targetType, value: row.targetValue },
          stop_loss: { type: row.stopType, value: row.stopValue },
        },
      });

      set({
        isLoading: false,
        availableCapital: result.capital_after_trade,
        lastOrder: result,
      });
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : "Order failed" });
    }
  },
}));
