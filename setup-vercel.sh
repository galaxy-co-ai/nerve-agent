#!/bin/bash
cd /c/Users/Owner/workspace/nerve-agent/apps/web
echo "Current directory: $(pwd)"
echo "Installing dependencies..."
npm install
echo "Deploying to Vercel..."
npx vercel --yes
