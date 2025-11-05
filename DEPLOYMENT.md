# Deployment Guide - Chatbot Evaluator

## 🚀 Quick Deploy to Vercel (Recommended)

### Method 1: Deploy from GitHub (Easiest)

1. **Push code to GitHub**

```bash
cd /home/phat/Code/test/chatbot-evaluator-ui
git init
git add .
git commit -m "Initial commit - Chatbot Evaluator MVP"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/chatbot-evaluator-ui.git
git push -u origin main
```

2. **Deploy on Vercel**

- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository
- Vercel will auto-detect Next.js
- Click "Deploy"
- Done! Your app will be live in ~2 minutes

### Method 2: Vercel CLI (From Local)

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
cd /home/phat/Code/test/chatbot-evaluator-ui
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? chatbot-evaluator-ui
# - Directory? ./
# - Override settings? No

# For production:
vercel --prod
```

Your app will be deployed to: `https://chatbot-evaluator-ui-xxx.vercel.app`

---

## 📋 Pre-deployment Checklist

- ✅ All pages created (Dashboard, Campaigns, Datasets, Evaluations, Comparison)
- ✅ UI components working (Navbar, Cards, Buttons, Badges)
- ✅ localStorage utilities implemented
- ✅ Mock data initialized
- ✅ TypeScript types defined
- ✅ Tailwind CSS configured
- ✅ Next.js build config ready
- ✅ .gitignore configured

---

## 🔧 Vercel Configuration

The project includes `vercel.json` with optimal settings:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["sin1"]
}
```

**Node.js Version**: Vercel automatically uses Node.js >= 20.x

---

## 🌐 Custom Domain (Optional)

After deployment:

1. Go to your project on Vercel
2. Settings → Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Wait for SSL certificate (automatic)

---

## 🐛 Troubleshooting

### Issue: Build fails with "Node version required >=20.9.0"

**Solution**: This is fine! Vercel uses Node 20+ automatically. Ignore local warnings.

### Issue: "Module not found" errors

**Solution**:

```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Page shows 404

**Solution**: Check file names match exactly (case-sensitive on Vercel):

- `app/page.tsx` (not `Page.tsx`)
- `app/campaigns/page.tsx`

### Issue: Styles not loading

**Solution**: Ensure `tailwind.config.ts` and `postcss.config.js` exist

---

## 📊 Post-Deployment

After successful deployment:

1. ✅ Visit your live URL
2. ✅ Test all pages (Dashboard, Campaigns, Datasets, Evaluations, Comparison)
3. ✅ Verify localStorage works (create a campaign, refresh page)
4. ✅ Test mobile responsiveness
5. ✅ Share URL with team!

---

## 🔄 Continuous Deployment

Once deployed via GitHub:

- Every push to `main` branch = auto-deploy to production
- Every PR = preview deployment with unique URL
- Vercel monitors and auto-rolls back on errors

---

## 💡 Tips

1. **Free Tier**: Vercel free tier is generous (100GB bandwidth/month)
2. **Analytics**: Enable Vercel Analytics for free usage insights
3. **Environment Variables**: Not needed for MVP (client-side only)
4. **Custom 404**: Add `app/not-found.tsx` for custom 404 page

---

## 📱 Share Your App

Your deployed app URL will look like:

```
https://chatbot-evaluator-ui.vercel.app
```

Or with custom domain:

```
https://evaluator.yourdomain.com
```

---

## 🎉 Success!

Your Chatbot Evaluator MVP is now live! 🚀

**Next Steps:**

- Test all features
- Gather user feedback
- Plan Phase 2 (backend API)

---

**Need help?** Open an issue or check Vercel docs: https://vercel.com/docs

