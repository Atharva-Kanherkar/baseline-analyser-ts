import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

try {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const dataPath = path.join(__dirname, 'node_modules', 'web-features', 'data.json');
  const data = JSON.parse(readFileSync(dataPath, 'utf-8'));
  console.log('✅ Direct file read works'); 
  console.log('Features count:', Object.keys(data.features || {}).length);
  console.log('Has grid feature:', !!data.features?.grid);
} catch (err) {
  console.log('❌ Direct file read failed:', err.message);
}
