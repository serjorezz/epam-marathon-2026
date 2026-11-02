import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const BUCKET = 'restaurant-frontend-060913167510';
const BUNDLE_DIR = resolve('dist/restaurant-frontend-app/browser');
const INDEX_HTML = resolve(BUNDLE_DIR, 'index.html');

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

console.log(`Syncing bundle to s3://${BUCKET}/...`);
execSync(`aws s3 sync ${BUNDLE_DIR}/ s3://${BUCKET}/`, { stdio: 'inherit' });

console.log('Uploading root path objects for clean SPA navigation (HTTP 200)...');
for (const route of routes) {
  execSync(
    `aws s3 cp "${INDEX_HTML}" "s3://${BUCKET}/${route}" --content-type "text/html"`,
    { stdio: 'inherit' }
  );
}

console.log('Deploy completed successfully.');
