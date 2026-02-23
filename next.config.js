// Polyfill Request global for environments where it's missing (older Node)
try {
  if (typeof Request === 'undefined') {
    // `undici` provides a Request implementation compatible with Web Fetch
    // Require it synchronously so Next's server modules can access Request.
    // If undici is not installed, this will throw and be ignored.
    // This file is loaded by Next on startup.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { Request: UndiciRequest } = require('undici');
    if (UndiciRequest) global.Request = UndiciRequest;
  }
} catch (e) {
  // ignore
}

/** @type {import('next').NextConfig} */
module.exports = {
  reactStrictMode: true,
};
