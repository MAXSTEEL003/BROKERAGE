// Polyfills for browser globals in server environment
if (typeof global !== 'undefined' && typeof window === 'undefined') {
  // Define self for libraries that expect it
  global.self = global;
  
  // Other browser globals that might be needed
  global.window = global;
  global.document = {
    createElement: () => ({}),
    getElementsByTagName: () => [],
    addEventListener: () => {},
  };
  global.navigator = { userAgent: 'node' };
  global.location = { href: '' };
}