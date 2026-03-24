import { GameSettings, LootType, RunOutcome, ZoneId } from '@/lib/game/types/gameTypes';

export interface HudPayload {
  health: number;
  energy: number;
  scrap: number;
  modules: string[];
  hint: string;
  zone: ZoneId;
  eventName?: string;
}

export interface RunResultPayload {
  outcome: RunOutcome;
  extractedScrap: number;
  blueprintFound?: string;
  codexUnlock?: string;
}

export interface BridgeEvents {
  hud: HudPayload;
  pickup: { type: LootType; amount: number };
  runEnd: RunResultPayload;
  interactPrompt: { text: string };
}

type EventKey = keyof BridgeEvents;
type Handler<K extends EventKey> = (payload: BridgeEvents[K]) => void;

export class GameBridge {
  private handlers: { [K in EventKey]?: Handler<K>[] } = {};

  emit<K extends EventKey>(event: K, payload: BridgeEvents[K]): void {
    this.handlers[event]?.forEach((handler) => handler(payload as never));
  }

  on<K extends EventKey>(event: K, handler: Handler<K>): () => void {
    const existing = this.handlers[event] ?? [];
    this.handlers[event] = [...existing, handler as never];
    return () => {
      this.handlers[event] = (this.handlers[event] ?? []).filter((h) => h !== handler);
    };
  }
}

export interface SessionConfig {
  zone: ZoneId;
  modules: string[];
  settings: GameSettings;
}
