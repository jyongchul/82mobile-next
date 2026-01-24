#!/bin/bash

# 82mobile Next.js Quick Start Script
# This script helps you get the development environment running quickly

set -e  # Exit on error

echo "=========================================="
echo "82mobile Headless Migration - Quick Start"
echo "=========================================="
echo ""

# Check Node.js version
echo "📋 Checking Node.js version..."
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js 18+ required (you have: $(node -v))"
    echo "   Please install Node.js 18 or higher"
    exit 1
fi
echo "✅ Node.js version OK: $(node -v)"
echo ""

# Check if .env.local exists
echo "📋 Checking environment variables..."
if [ ! -f ".env.local" ]; then
    echo "⚠️  Warning: .env.local not found"
    echo "   Creating from .env.example..."
    cp .env.example .env.local
    echo "✅ Created .env.local"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.local with your credentials:"
    echo "   - WC_CONSUMER_KEY (from WordPress WooCommerce API)"
    echo "   - WC_CONSUMER_SECRET (from WordPress WooCommerce API)"
    echo ""
    read -p "Press Enter when you've updated .env.local (or continue without credentials)..."
else
    echo "✅ .env.local found"
fi
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
if [ ! -d "node_modules" ]; then
    npm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed (skip with: npm ci)"
fi
echo ""

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "❌ Error: node_modules not found"
    echo "   Run: npm install"
    exit 1
fi

# Build the project (to catch any errors early)
echo "🔨 Type-checking project..."
npx tsc --noEmit || {
    echo "⚠️  Warning: TypeScript errors found"
    echo "   You can still run the dev server, but fix these eventually"
}
echo ""

# Start development server
echo "🚀 Starting development server..."
echo ""
echo "=========================================="
echo "✅ Setup Complete!"
echo "=========================================="
echo ""
echo "📝 Next steps:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Test API integration: http://localhost:3000/api/test"
echo "3. Read PHASE0_SETUP_GUIDE.md for WordPress setup tasks"
echo ""
echo "🔧 Useful commands:"
echo "  npm run dev        → Start dev server"
echo "  npm run build      → Build for production"
echo "  npm run lint       → Check code quality"
echo "  npm run type-check → Check TypeScript errors"
echo ""
echo "📞 Support: jyongchul@naver.com (이종철)"
echo ""
echo "Starting server in 3 seconds..."
sleep 3

npm run dev
