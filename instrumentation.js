// This file is used to set up server-side instrumentation
export function register() {
  // Server-side initialization code here
  console.log('Server initialized');
}

export function onRequestError(err, request, context) {
  // Handle server-side errors
  console.error('Server error:', err.message);
}