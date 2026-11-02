import { copyFileSync, mkdirSync, existsSync, writeFileSync } from 'node:fs';
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

// Create 404.html (SPA fallback for dynamic routes like /locations/:id and /reservations/:id/group-order)
copyFileSync(indexHtmlPath, join(BUNDLE_DIR, '404.html'));

// Create CNAME and .nojekyll for GitHub Pages custom domain hosting
writeFileSync(join(BUNDLE_DIR, 'CNAME'), 'green-tasty.devs.surf\n');
writeFileSync(join(BUNDLE_DIR, '.nojekyll'), '');

console.log(`Generated SPA route copies, 404.html, and CNAME for: ${routes.join(', ')}`);
