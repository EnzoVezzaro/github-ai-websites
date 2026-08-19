/**
 * Ambient module declarations for optional / heavy optional dependencies.
 *
 * These packages are intentionally NOT part of the bundled core:
 * - `yjs` / `y-webrtc`  → collaborative editing (experimental, not in default graph)
 * - `tldraw`            → whiteboard plugin (experimental)
 * - `marked`            → markdown util (installed, no published types bundled here)
 * - `@chenglou/pretext` → pure text layout (optional, try/catch at runtime)
 *
 * The app's runtime module graph (main.tsx → StartUpGate → Studio / Preview)
 * does not reach these modules, so only the type checker requires them here.
 */

declare module 'yjs' {
  class YMap<T = unknown> {
    set(key: string, value: T): void;
    get(key: string): T | undefined;
    delete(key: string): void;
    observe(fn: () => void): void;
    unobserve(fn: () => void): void;
  }
  class Doc {
    clientID: number;
    getMap(name: string): YMap<unknown>;
    transact(fn: () => void): void;
  }
  export { Doc, YMap };
}

declare module 'y-webrtc' {
  export class WebrtcProvider {
    constructor(room: string, doc: unknown, opts?: Record<string, unknown>);
    awareness: {
      getLocalState(): any;
      setLocalStateField(key: string, value: unknown): void;
      getStates(): Map<string | number, any>;
      on(ev: string, cb: () => void): void;
    };
    on(ev: string, cb: (arg: never) => void): void;
    disconnect(): void;
    destroy(): void;
  }
}

declare module 'marked' {
  export function setOptions(options: Record<string, unknown>): void;
  export function parse(src: string): string | Promise<string>;
  export const marked: {
    setOptions(options: Record<string, unknown>): void;
    parse(src: string): string | Promise<string>;
  };
}

declare module '@interactjs/interactjs' {
  export interface InteractDragEvent {
    dx: number;
    dy: number;
    target: HTMLElement;
    interaction: unknown;
  }
  export interface InteractDraggable {
    draggable(options: {
      inertia?: boolean;
      listeners?: {
        start?: (e: InteractDragEvent) => void;
        move?: (e: InteractDragEvent) => void;
        end?: (e: InteractDragEvent) => void;
      };
    }): InteractDraggable;
    unset(): void;
  }
  const interact: (target: string | HTMLElement) => InteractDraggable;
  export default interact;
}

declare module 'tldraw' {
  export function Tldraw(): import('react').ReactElement;
}

declare module '@chenglou/pretext' {
  export function prepare(text: string, font: string): unknown;
  export function layout(prepared: unknown, maxWidth: number, lineHeight: number): { height: number; lineCount: number };
};
