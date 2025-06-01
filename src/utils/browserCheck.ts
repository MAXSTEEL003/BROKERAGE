export const isBrowser = typeof window !== 'undefined';
export const isServer = !isBrowser;

// Safe access to browser-only objects
export const getWindow = () => (isBrowser ? window : undefined);
export const getDocument = () => (isBrowser ? document : undefined);
export const getSelf = () => (isBrowser ? self : undefined);