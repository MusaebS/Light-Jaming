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

export type SceneKey = 'boot' | 'title' | 'run' | 'results' | 'workshop';

export interface SceneTransitionPayload {
  from: SceneKey;
  to: SceneKey;
  reason: 'boot' | 'start-run' | 'run-complete' | 'return-to-workshop';
}

export interface BridgeEvents {
  hud: HudPayload;
  pickup: { type: LootType; amount: number };
  runEnd: RunResultPayload;
  sceneTransition: SceneTransitionPayload;
  shellNavigation: { screen: 'workshop' | 'game' };
  interactPrompt: { text: string };
  pauseState: { paused: boolean };
  control: {
    control: 'up' | 'down' | 'left' | 'right' | 'action' | 'dodge' | 'interact' | 'pause';
    active: boolean;
  };
  assetLoadComplete: {
    totalComplete: number;
    totalFailed: number;
    totalToLoad: number;
  };
}

type EventKey = keyof BridgeEvents;
type Handler<K extends EventKey> = (payload: BridgeEvents[K]) => void;
type HandlerStore = { [K in EventKey]?: Handler<K>[] };

export class GameBridge {
  private handlers: HandlerStore = {};

  emit<K extends EventKey>(event: K, payload: BridgeEvents[K]): void {
    const eventHandlers = (this.handlers[event] ?? []) as Handler<K>[];
    eventHandlers.forEach((handler) => handler(payload));
  }

  on<K extends EventKey>(event: K, handler: Handler<K>): () => void {
    const existing = (this.handlers[event] ?? []) as Handler<K>[];
    this.handlers[event] = [...existing, handler] as HandlerStore[K];
    return () => {
      const current = (this.handlers[event] ?? []) as Handler<K>[];
      this.handlers[event] = current.filter((entry) => entry !== handler) as HandlerStore[K];
    };
  }
}

export interface SessionConfig {
  zone: ZoneId;
  modules: string[];
  settings: GameSettings;
}
