#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('__filename:', __filename);

// Try different paths to find data.json
const paths = [
  './data.json',
  path.join(__dirname, 'data.json'),
  path.join(process.cwd(), 'data.json'),
  path.join(process.cwd(), 'dist', 'bundled', 'data.json'),
  './dist/bundled/data.json'
];

paths.forEach(testPath => {
  try {
    const exists = fs.existsSync(testPath);
    console.log(`Path "${testPath}": ${exists ? 'EXISTS' : 'NOT FOUND'}`);
    if (exists) {
      const stats = fs.statSync(testPath);
      console.log(`  Size: ${stats.size} bytes`);
    }
  } catch (error) {
    console.log(`Path "${testPath}": ERROR - ${error.message}`);
  }
});

// Try to read data.json if found
const dataPath = path.join(__dirname, 'data.json');
if (fs.existsSync(dataPath)) {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log('\n✅ Successfully read data.json');
    console.log(`Features count: ${Object.keys(data.features || {}).length}`);
  } catch (error) {
    console.log('\n❌ Failed to parse data.json:', error.message);
  }
}
