import { copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const BUNDLE_DIR = resolve('dist/restaurant-frontend-app/browser');
const indexHtmlPath = join(BUNDLE_DIR, 'index.html');

if (!existsSync(indexHtmlPath)) {
  console.error(`Index file not found at ${indexHtmlPath}`);
  process.exit(1);
}

const routes = [
  'main',
  'tables',
  'menu',
  'reservations',
  'waiter-reservations',
  'reports',
  'profile',
  'login',
  'signup',
  'reservation-confirmed',
  'waiter-pre-order',
  'guest-pre-order-expired',
];

for (const route of routes) {
  const routeDir = join(BUNDLE_DIR, route);
  mkdirSync(routeDir, { recursive: true });
  copyFileSync(indexHtmlPath, join(routeDir, 'index.html'));
}

console.log(`Generated SPA route copies for: ${routes.join(', ')}`);
