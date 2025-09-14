#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('=== DOM API BASELINE TEST ===');

// Create a simple test HTML file with DOM APIs
const testContent = `
document.querySelectorAll('.test');
element.addEventListener('click', handler);
element.querySelector('#test');
fetch('/api/data');
`;

fs.writeFileSync('./test-dom-features.js', testContent);

console.log('Created test file with DOM APIs...');
console.log('Test content:', testContent);

// Now let's manually test the BaselineService
try {
    console.log('\n--- Testing BaselineService directly ---');
    
    // Since the service is bundled into chunks, let's create a simple feature list
    const features = [
        { name: 'api.Document.querySelectorAll' },
        { name: 'api.EventTarget.addEventListener' }, 
        { name: 'api.fetch' },
        { name: 'css.properties.display.grid' }
    ];

    console.log('\nFeatures to test:');
    features.forEach(f => console.log(`  - ${f.name}`));
    
} catch (error) {
    console.error('Error:', error);
}

// Clean up
fs.unlinkSync('./test-dom-features.js');
