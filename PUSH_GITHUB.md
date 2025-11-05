# 📤 Push to GitHub - Complete Guide

## 🔑 GitHub Authentication Required

Git push cần authentication. Có 2 cách:

---

## Option 1: Personal Access Token (Recommended for HTTPS) 🔐

### Step 1: Create Token

1. Đi tới: https://github.com/settings/tokens
2. Click "**Generate new token**" → "**Generate new token (classic)**"
3. Note: "Vercel Deploy - Chatbot Evaluator"
4. Expiration: 90 days (hoặc No expiration)
5. Scopes: Check **repo** (full control)
6. Click "**Generate token**"
7. **Copy token** (chỉ hiện 1 lần!)

### Step 2: Push with Token

```bash
cd /home/phat/Code/test/chatbot-evaluator-ui

# Push (sẽ hỏi username và password)
git push -u origin main

# When prompted:
# Username: tntphat
# Password: [paste your token here]
```

**Or use token directly:**

```bash
git remote set-url origin https://YOUR_TOKEN@github.com/tntphat/chatbot-evaluator-ui.git
git push -u origin main
```

---

## Option 2: SSH Key (Better for Long-term) 🔑

### Step 1: Generate SSH Key

```bash
# Check if you have SSH key
ls ~/.ssh/id_ed25519.pub

# If not, generate new key
ssh-keygen -t ed25519 -C "your_email@example.com"
# Press Enter 3 times (default location, no passphrase)

# Copy public key
cat ~/.ssh/id_ed25519.pub
# Copy the output
```

### Step 2: Add to GitHub

1. Đi tới: https://github.com/settings/keys
2. Click "**New SSH key**"
3. Title: "Arch Linux - Laptop"
4. Key: Paste your public key
5. Click "**Add SSH key**"

### Step 3: Change Remote to SSH

```bash
cd /home/phat/Code/test/chatbot-evaluator-ui
git remote set-url origin git@github.com:tntphat/chatbot-evaluator-ui.git
git push -u origin main
```

---

## Option 3: GitHub CLI (Easiest) 🚀

### Install GitHub CLI (Arch Linux)

```bash
# Install
sudo pacman -S github-cli

# Or with yay
yay -S github-cli

# Login
gh auth login
# Choose: GitHub.com → HTTPS → Yes (authenticate) → Login with browser

# Push
cd /home/phat/Code/test/chatbot-evaluator-ui
git push -u origin main
```

---

## 🎯 Recommended: Use GitHub CLI

**Why?**

- ✅ Easiest setup
- ✅ Secure authentication
- ✅ Works everywhere
- ✅ One-time setup

**Quick install:**

```bash
sudo pacman -S github-cli
gh auth login
# Follow prompts in browser
cd /home/phat/Code/test/chatbot-evaluator-ui
git push -u origin main
```

---

## ✅ After Successful Push

When git push succeeds, you'll see:

```
Enumerating objects: 50, done.
Counting objects: 100% (50/50), done.
Delta compression using up to 8 threads
Compressing objects: 100% (45/45), done.
Writing objects: 100% (50/50), 150.00 KiB | 5.00 MiB/s, done.
Total 50 (delta 2), reused 0 (delta 0), pack-reused 0
To https://github.com/tntphat/chatbot-evaluator-ui.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

Then:

1. Go to https://github.com/tntphat/chatbot-evaluator-ui
2. Refresh → See all your code! ✅

---

## 🚀 Next: Deploy on Vercel

### Step 1: Go to Vercel

1. Open: https://vercel.com
2. Login with GitHub
3. Click "**Add New...**" → "**Project**"

### Step 2: Import Repository

1. Find "chatbot-evaluator-ui"
2. Click "**Import**"

### Step 3: Configure (Leave defaults)

- Framework Preset: **Next.js** (auto-detected)
- Root Directory: `./`
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`

### Step 4: Deploy

1. Click "**Deploy**"
2. Wait 2-3 minutes
3. Done! 🎉

You'll get:

```
✅ Deployment successful!
🌐 https://chatbot-evaluator-ui.vercel.app
```

---

## 🐛 Troubleshooting

### Error: "Authentication failed"

**Solution**: Use Personal Access Token (see Option 1 above)

### Error: "Permission denied (publickey)"

**Solution**: Add SSH key to GitHub (see Option 2 above)

### Error: "Repository not found"

**Solution**: Check repository exists at:
https://github.com/tntphat/chatbot-evaluator-ui

---

## 📋 Current Status

✅ Code ready (committed locally)
✅ GitHub repo created (empty)
⏳ Need to push code
⏳ Then deploy on Vercel

---

**Which auth method do you prefer?**

1. Personal Access Token (quick)
2. SSH Key (better long-term)
3. GitHub CLI (easiest)

Let me know and I'll help! 😊


