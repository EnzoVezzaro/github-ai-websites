/** Window augmentation for the interact.js UMD bundle loaded via CDN. */
export {};

declare global {
  interface Window {
    interact?: (target: string | HTMLElement) => {
      draggable(options: {
        inertia?: boolean;
        listeners?: {
          start?: (e: { dx: number; dy: number; target: HTMLElement }) => void;
          move?: (e: { dx: number; dy: number; target: HTMLElement }) => void;
          end?: (e: { dx: number; dy: number; target: HTMLElement }) => void;
        };
      }): { unset: () => void };
      unset(): void;
    };
  }
}
