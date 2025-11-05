# 🚀 Deploy to Vercel - Arch Linux Guide

## 📋 Prerequisites

Check your Node version:

```bash
node --version
# If < 18, need to upgrade for local build (Vercel will use Node 20+ anyway)
```

---

## 🎯 Deployment Options

### Option 1: Vercel CLI (Recommended) ⚡

#### Step 1: Login to Vercel

```bash
cd /home/phat/Code/test/chatbot-evaluator-ui
vercel login
```

This will:

1. Show you a URL like: `https://vercel.com/oauth/device?user_code=XXXX-XXXX`
2. Ask you to press ENTER to open browser
3. Or manually open the URL in browser
4. Login with GitHub/GitLab/Email
5. Approve the device

#### Step 2: Deploy

```bash
vercel
```

Answer the prompts:

```
? Set up and deploy "~/Code/test/chatbot-evaluator-ui"? [Y/n] Y
? Which scope do you want to deploy to? [Your Username]
? Link to existing project? [y/N] N
? What's your project's name? chatbot-evaluator-ui
? In which directory is your code located? ./
```

Wait ~2 minutes → Get URL! 🎉

#### Step 3: Production Deploy

```bash
vercel --prod
```

Your app will be live at:

```
https://chatbot-evaluator-ui.vercel.app
```

---

### Option 2: GitHub → Vercel (Most Reliable) 🐙

#### Step 1: Push to GitHub

```bash
cd /home/phat/Code/test/chatbot-evaluator-ui

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Chatbot Evaluator MVP"

# Create repo on GitHub (go to github.com → New Repository)
# Then:
git remote add origin https://github.com/YOUR_USERNAME/chatbot-evaluator-ui.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy on Vercel Web

1. Go to [vercel.com](https://vercel.com)
2. Login with GitHub
3. Click "**New Project**"
4. Click "**Import**" on your repository
5. Click "**Deploy**"
6. Wait 2-3 minutes
7. Done! 🎉

**URL will be**: `https://chatbot-evaluator-ui-xxx.vercel.app`

---

### Option 3: Quick Deploy Button 🔗

If you push to GitHub, add this to README:

```markdown
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/chatbot-evaluator-ui)
```

Anyone can deploy with 1 click!

---

## 🛠️ Troubleshooting

### Issue: Node version 16 warning

**Impact**: None! Vercel uses Node 20+ automatically
**Solution**: Ignore local warnings

### Issue: "vercel: command not found"

**Solution**:

```bash
# Check if installed
npm list -g vercel

# Reinstall
npm install -g vercel

# Or use npx
npx vercel
```

### Issue: Login timeout

**Solution**:

1. Copy the URL manually
2. Open in browser
3. Login
4. Come back to terminal
5. Press ENTER

### Issue: Build fails on Vercel

**Solution**: Check build logs on Vercel dashboard

```bash
# Test build locally first
npm run build
```

---

## 📱 After Deployment

### What You Get:

- ✅ Live URL: `https://your-app.vercel.app`
- ✅ Auto SSL certificate (HTTPS)
- ✅ CDN distribution (fast worldwide)
- ✅ Auto deployments (on git push)
- ✅ Preview deployments (for PRs)

### Test Deployment:

1. Open URL
2. Test all pages
3. Create campaign
4. Create dataset
5. Review evaluation
6. Verify localStorage works
7. Test on mobile
8. Share with team!

---

## 🎯 Recommended: Option 2 (GitHub)

**Why?**

- ✅ Most reliable
- ✅ No local Node version issues
- ✅ Auto-deploy on push
- ✅ Preview deployments
- ✅ Easy rollbacks

**Steps:**

```bash
# 1. Push to GitHub (5 min)
git init
git add .
git commit -m "Chatbot Evaluator MVP"
# Create repo on GitHub
git remote add origin https://github.com/YOUR_USERNAME/chatbot-evaluator-ui.git
git push -u origin main

# 2. Deploy on Vercel (2 min)
# - Go to vercel.com
# - Import GitHub repo
# - Click Deploy
# - Done!
```

---

## 🚀 Quick Deploy Script

Save this as `deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Deploying Chatbot Evaluator to Vercel..."

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "📝 Logging in to Vercel..."
    vercel login
fi

# Deploy
echo "🚀 Deploying..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Check your Vercel dashboard for the URL"
```

Run:

```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 🔑 Environment Setup (Optional)

For future automation:

```bash
# Get Vercel token from: https://vercel.com/account/tokens
export VERCEL_TOKEN="your_token_here"

# Deploy without prompts
vercel --token $VERCEL_TOKEN --prod
```

---

## 📊 Deployment Stats

**Expected Times:**

- First deploy: 3-5 minutes
- Subsequent deploys: 1-2 minutes
- Build time: ~1 minute
- Deployment time: ~1 minute

**Resources Used:**

- Build: ~500MB RAM
- Bundle size: ~500KB (gzipped)
- Free tier: 100GB bandwidth/month

---

## ✅ What to Do Now

**I recommend Option 2 (GitHub)** because:

1. Your local Node version is 16 (old)
2. GitHub → Vercel = most stable
3. Auto-deploy on every push
4. No CLI issues

**Quick Steps:**

```bash
# 1. Push to GitHub
cd /home/phat/Code/test/chatbot-evaluator-ui
git init
git add .
git commit -m "Chatbot Evaluator MVP"

# 2. Create repo on GitHub
# Visit github.com → New Repository → "chatbot-evaluator-ui"

# 3. Push
git remote add origin https://github.com/YOUR_USERNAME/chatbot-evaluator-ui.git
git branch -M main
git push -u origin main

# 4. Deploy on Vercel
# Visit vercel.com → Import GitHub repo → Deploy

# Done! 🎉
```

---

**Need me to help with any specific step?** 😊

