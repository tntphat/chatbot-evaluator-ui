#!/bin/bash

# ============================================
# Chatbot Evaluator - Deploy Commands
# ============================================

echo "🚀 Chatbot Evaluator - Deploy Script"
echo ""

# Step 1: Push to GitHub
echo "📤 Step 1: Pushing to GitHub..."
echo ""
echo "⚠️  You need a Personal Access Token!"
echo "   1. Go to: https://github.com/settings/tokens/new"
echo "   2. Note: 'Chatbot Evaluator'"
echo "   3. Check: repo (full control)"
echo "   4. Generate & COPY token"
echo ""
echo "Now pushing..."
echo ""

git push -u origin main

echo ""
echo "✅ Push complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Verify code at: https://github.com/tntphat/chatbot-evaluator-ui"
echo "   2. Go to Vercel: https://vercel.com/new"
echo "   3. Import your repo"
echo "   4. Click Deploy"
echo ""
echo "🎉 Your app will be live in 2-3 minutes!"




