import { exec, execSync } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'node:path';

const execAsync = promisify(exec);

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

console.log('Uploading root path objects for clean SPA navigation in parallel...');
await Promise.all(
  routes.map((route) =>
    execAsync(
      `aws s3 cp "${INDEX_HTML}" "s3://${BUCKET}/${route}" --content-type "text/html"`
    )
  )
);

console.log('Deploy completed successfully.');
