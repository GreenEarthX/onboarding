declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      render: (container: HTMLElement | string, parameters: { sitekey: string; size?: 'invisible' | 'normal' | 'compact'; callback?: (token: string) => void }) => number;
      execute: (widgetId: number) => Promise<string>;
      reset: (widgetId?: number) => void;
    };
  }
}