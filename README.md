# Chatbot Evaluator - MVP UI

A modern web application for evaluating and improving chatbot quality with data-driven insights.

## 🚀 Features

### MVP (Current)

- ✅ **Dashboard** - Overview of evaluation metrics and campaigns
- ✅ **Campaign Management** - Create and manage evaluation campaigns
- ✅ **Test Datasets** - Organize test data for evaluations
- ✅ **Human Evaluation Portal** - Review conversations manually
- ✅ **Comparison Tool** - Compare chatbot versions side-by-side
- ✅ **Local Storage** - All data persisted in browser

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Storage**: LocalStorage (no backend required for MVP)
- **Deployment**: Vercel

## 📦 Installation

```bash
# Clone the repository
git clone <repo-url>
cd chatbot-evaluator-ui

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 🚀 Deploy to Vercel

### Method 1: Vercel CLI (Recommended)

```bash
# Install Vercel CLI globally
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### Method 2: GitHub Integration

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Next.js and deploy

### Method 3: Manual Deploy from Local

```bash
# Production deployment
vercel --prod
```

## 📁 Project Structure

```
chatbot-evaluator-ui/
├── app/                      # Next.js App Router pages
│   ├── campaigns/           # Campaign management
│   ├── datasets/            # Test dataset management
│   ├── evaluations/         # Human evaluation portal
│   ├── comparison/          # Comparison & A/B testing
│   ├── layout.tsx           # Root layout with Navbar
│   └── page.tsx             # Dashboard (home page)
├── components/
│   ├── layout/
│   │   └── Navbar.tsx       # Main navigation
│   └── ui/
│       ├── Card.tsx         # Card components
│       ├── Button.tsx       # Button component
│       └── Badge.tsx        # Badge component
├── lib/
│   ├── types.ts             # TypeScript types
│   └── storage.ts           # LocalStorage utilities
├── public/                   # Static assets
└── README.md                # This file
```

## 💾 Data Storage

All data is stored in browser's localStorage:

- `chatbots` - Chatbot configurations
- `campaigns` - Evaluation campaigns
- `datasets` - Test datasets
- `evaluations` - Evaluation results
- `ab_tests` - A/B test data

**Note**: Data is specific to each browser. Clearing browser data will reset the app.

## 🎨 Key Pages

### Dashboard (/)

- Overview metrics
- Recent campaigns
- Quick actions

### Campaigns (/campaigns)

- List all campaigns
- Filter by status (draft, running, completed)
- View campaign results
- Delete campaigns

### Datasets (/datasets)

- Manage test datasets
- View dataset details
- Delete datasets

### Evaluations (/evaluations)

- Human evaluation queue
- Review conversations
- Rate quality

### Comparison (/comparison)

- Select 2 chatbots to compare
- View side-by-side metrics
- Get recommendations

## 🔧 Configuration

### Environment Variables

No environment variables needed for MVP (all client-side).

### Customization

**Colors**: Edit `tailwind.config.ts` to customize theme colors

**Mock Data**: Edit `lib/storage.ts` > `initializeMockData()` to change initial data

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🐛 Troubleshooting

### Issue: Data not persisting

**Solution**: Check if browser allows localStorage. Try opening in incognito mode to test.

### Issue: Build errors

**Solution**: Delete `.next` folder and `node_modules`, then run:

```bash
rm -rf .next node_modules
npm install
npm run build
```

### Issue: Vercel deployment fails

**Solution**: Ensure Node.js version >= 20.9.0 in Vercel project settings.

## 🚧 Roadmap

### Phase 2 (Future)

- [ ] Backend API integration
- [ ] Real-time evaluation engine
- [ ] LLM-as-Judge (GPT-4 evaluation)
- [ ] Advanced analytics & charts
- [ ] Multi-user support with authentication
- [ ] Export reports (PDF, Excel)
- [ ] Webhook integrations

### Phase 3 (Future)

- [ ] Multi-language support
- [ ] Bias & safety testing
- [ ] Cost optimization tools
- [ ] API marketplace
- [ ] Enterprise features

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please open an issue or submit a PR.

---

**Built with ❤️ for better chatbot quality**
