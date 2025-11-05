# 🔑 Add SSH Key & Push - 2 Minutes

## Step 1: Add SSH Key to GitHub (1 click + paste)

### 1. Copy your SSH key:

```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICU7HKpRaWbosCNJaqrL/bHFmH0e8yTO4kXoDvfsmfh5 phat@fat-asus
```

### 2. Click this link:

**https://github.com/settings/ssh/new**

### 3. Fill form:

- **Title**: `Arch Linux - Laptop`
- **Key**: Paste the key above
- Click "**Add SSH key**"

✅ Done!

---

## Step 2: Push to GitHub (1 command)

Run in terminal:

```bash
cd /home/phat/Code/test/chatbot-evaluator-ui
git push -u origin main
```

Should see:

```
Enumerating objects: 50, done.
...
To github.com:tntphat/chatbot-evaluator-ui.git
 * [new branch]      main -> main
```

✅ Success!

---

## Step 3: Verify

Check: https://github.com/tntphat/chatbot-evaluator-ui

Refresh → See your code! ✅

---

## Step 4: Deploy Vercel

1. Go to: **https://vercel.com/new**
2. Import "chatbot-evaluator-ui"
3. Click "Deploy"
4. Wait 2 min → Done! 🎉

---

**Total time: 3 minutes**

**Làm Step 1 trước (add SSH key) rồi báo tôi nhé!** 😊


