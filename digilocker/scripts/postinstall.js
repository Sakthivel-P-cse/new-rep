#!/usr/bin/env node
// Ensure uploads directory exists after install
const { mkdirSync, existsSync } = require('fs');
const { join } = require('path');

const uploadsDir = join(process.cwd(), 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
  console.log(`[postinstall] Created uploads directory at ${uploadsDir}`);
}

