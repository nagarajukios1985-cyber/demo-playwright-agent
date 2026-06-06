#!/bin/bash

echo "🚀 Setting up project..."

# Create package.json if missing
if [ ! -f package.json ]; then
  npm init -y
fi

# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install

npm install openai

npm install dotenv

echo "✅ Setup complete"
