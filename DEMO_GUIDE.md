# 🎬 Demo Guide - Chatbot Evaluator

## 🚀 Demo Flow (5 phút)

### 1. Dashboard (/) ✅

**URL**: `/`

**Features:**

- View overview metrics (campaigns, quality scores, pass rate)
- See recent campaigns with status
- Quick actions cards

**Demo Steps:**

1. Open app → See 2 mock campaigns
2. View metrics: 2 campaigns, avg quality 4.2/5, pass rate 85%
3. Click on any campaign card → Goes to campaign detail

---

### 2. Create Campaign (/campaigns/new) ✅

**URL**: `/campaigns/new`

**Features:**

- Form to create new campaign
- Select chatbot(s)
- Choose evaluation type (automated/human)
- Select test dataset
- Choose metrics

**Demo Steps:**

1. Click "New Campaign" from dashboard or campaigns page
2. Fill form:
   - Name: "Test Campaign Demo"
   - Description: "Testing the evaluator"
   - Select chatbot: "Customer Support Bot v2.1"
   - Check "Automated Testing"
   - Select dataset: "Customer Support Q&A"
   - Check metrics: accuracy, quality
3. Click "Create Campaign"
4. Redirected to campaigns list
5. **See new campaign in list!** ✨

---

### 3. Campaigns List (/campaigns) ✅

**URL**: `/campaigns`

**Features:**

- List all campaigns
- Filter by status (all, running, completed, draft)
- View campaign summary
- Delete campaigns

**Demo Steps:**

1. Navigate to Campaigns
2. See 2 mock campaigns + any newly created
3. Filter by "Completed" → See 1 campaign
4. Filter by "Running" → See 1 campaign
5. Click on campaign → Goes to detail page

---

### 4. Campaign Detail (/campaigns/[id]) ✅

**URL**: `/campaigns/camp_001` (example)

**Features:**

- Full campaign information
- Progress tracking
- Detailed metrics (pass rate, quality, task completion, response time)
- Test summary
- Recommendations based on results

**Demo Steps:**

1. Click on "iPhone 15 Launch Q4 2024" campaign
2. See:
   - Campaign info (chatbot, type, created date)
   - Progress bar (100% completed)
   - Metrics cards:
     - Pass Rate: 85%
     - Quality Score: 4.2/5
     - Task Completion: 92%
     - Response Time: 450ms
   - Test Summary: 1250 total, 1063 passed, 187 failed
   - Recommendations (quality warnings/successes)
3. Try "Download Report" button (shows alert - mock)
4. Click "Back" → Returns to campaigns list

---

### 5. Datasets (/datasets) ✅

**URL**: `/datasets`

**Features:**

- Grid view of test datasets
- Dataset cards with info (type, items, tags)
- Create/Edit/Delete actions

**Demo Steps:**

1. Navigate to Datasets
2. See 3 mock datasets:
   - Customer Support Q&A (150 items)
   - Product FAQ Dataset (300 items)
   - Edge Cases (50 items)
3. View dataset tags (support, order, refund, etc.)
4. Click "View" on any dataset (shows alert - mock)
5. Click "Delete" → Confirms and removes dataset
6. Refresh → Dataset still gone! (localStorage works)

---

### 6. Evaluations (/evaluations) ✅

**URL**: `/evaluations`

**Features:**

- Human evaluation queue
- Priority badges (high, medium, low)
- Status badges (pending, in review, completed)
- Statistics cards

**Demo Steps:**

1. Navigate to Evaluations
2. See evaluation queue with 3 conversations
3. View statistics:
   - Pending: 12
   - In Review: 3
   - Completed: 156
4. Click "Review Now" (shows alert - mock)
5. Filter by priority/status (mock)

---

### 7. Comparison (/comparison) ✅

**URL**: `/comparison`

**Features:**

- Select 2 chatbots to compare
- Side-by-side metrics table
- Winner detection
- Recommendations

**Demo Steps:**

1. Navigate to Comparison
2. Select Variant A: "Customer Support Bot v2.1"
3. Select Variant B: "Sales Assistant Bot v1.5"
4. Click "Compare"
5. See comparison table with 6 metrics:
   - Overall Score, Accuracy, Task Completion, etc.
   - All metrics show Variant B as winner
   - Green highlight for better metrics
6. View recommendations:
   - "Deploy Variant B"
   - Rollout strategy: 25% → 50% → 100%
7. Click "Download Report" (mock)

---

## 🎯 Full Demo Script (Presentation)

### Intro (30 sec)

"Welcome to Chatbot Evaluator - a platform to evaluate and improve chatbot quality with data-driven insights."

### Dashboard (1 min)

1. "Here's our dashboard showing overview metrics"
2. "We have 2 campaigns running"
3. "Average quality score is 4.2/5 - that's good!"
4. "Pass rate is 85% - needs improvement to hit our 90% target"

### Create Campaign (1.5 min)

1. "Let's create a new evaluation campaign"
2. "I'll name it 'Product Launch Q1 2025'"
3. "Select Customer Support Bot"
4. "Choose automated testing"
5. "Pick our Customer Support Q&A dataset"
6. "Select metrics: accuracy, quality, response time"
7. "Create! → Campaign is now in our list"

### View Campaign Details (1.5 min)

1. "Click on iPhone 15 Launch campaign"
2. "This is completed - 100% progress"
3. "Pass rate: 85%, Quality: 4.2/5"
4. "Task completion is excellent at 92%"
5. "Response time is 450ms - pretty fast!"
6. "System gives us recommendations"
7. "We can download detailed reports"

### Compare Chatbots (1 min)

1. "Let's compare two chatbot versions"
2. "Select Support Bot v2.1 vs Sales Bot v1.5"
3. "Click Compare"
4. "Variant B wins in all 6 metrics!"
5. "System recommends deploying Variant B"
6. "Suggests gradual rollout strategy"

### Wrap Up (30 sec)

"That's Chatbot Evaluator! Key features:

- ✅ Campaign management
- ✅ Automated & human evaluation
- ✅ Detailed metrics & insights
- ✅ Comparison & A/B testing
- ✅ Data-driven recommendations

All data persists in browser localStorage - no backend needed for demo!"

---

## ✅ Checklist: What Works

- [x] Dashboard with metrics
- [x] Campaign list & filtering
- [x] Create new campaign (full form)
- [x] Campaign detail page
- [x] Datasets management
- [x] Evaluations queue
- [x] Chatbot comparison
- [x] Navigation between pages
- [x] localStorage persistence
- [x] Mock data initialization
- [x] Responsive design

---

## 🗂️ Mock Data Summary

### Chatbots (3)

1. Customer Support Bot v2.1
2. Sales Assistant Bot v1.5
3. FAQ Bot v3.0

### Campaigns (2)

1. **iPhone 15 Launch Q4 2024** (completed)
   - Pass rate: 85%
   - Quality: 4.2/5
   - 1250 tests
2. **Sales Bot v2.0 Testing** (running)
   - Progress: 65%

### Datasets (3)

1. Customer Support Q&A (150 items)
2. Product FAQ (300 items)
3. Edge Cases (50 items)

---

## 🎨 UI Highlights

- **Modern Design**: Clean, professional look
- **Responsive**: Works on mobile, tablet, desktop
- **Color Coding**:
  - Green: Success/Positive
  - Yellow: Warning
  - Red: Error/Negative
  - Blue: Info/Running
  - Gray: Neutral/Draft
- **Icons**: Emojis for visual appeal 🎯📊⭐✅
- **Smooth Transitions**: Hover effects, page transitions

---

## 💡 Tips for Demo

1. **Start fresh**: Clear localStorage if needed

   ```javascript
   // In browser console:
   localStorage.clear();
   // Then refresh
   ```

2. **Create campaign**: Show the form works
3. **View details**: Click through to detail page
4. **Delete & recreate**: Show persistence
5. **Compare**: Demo comparison feature
6. **Mobile view**: Show responsive design

---

## 🚀 Deploy & Share

**Vercel URL**: `https://your-app.vercel.app`

Share this URL with your team! Everyone can:

- View campaigns
- Create new campaigns
- Compare chatbots
- All data stays in their browser

---

**Ready to present! 🎉**

