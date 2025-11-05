# 🚀 Quick Start Guide

## Cách nhanh nhất để deploy lên Vercel

### Option 1: Deploy trực tiếp từ local (5 phút) ⚡

```bash
# 1. Cài Vercel CLI
npm i -g vercel

# 2. Login vào Vercel
vercel login

# 3. Deploy (từ folder dự án)
cd /home/phat/Code/test/chatbot-evaluator-ui
vercel

# 4. Làm theo hướng dẫn:
# - Link to existing project? No
# - Project name? chatbot-evaluator-ui
# - Directory? ./ (press Enter)
# - Override settings? No (press Enter)

# 5. Đợi ~2 phút → Done! 🎉
```

Vercel sẽ cho bạn URL như: `https://chatbot-evaluator-ui-abc123.vercel.app`

### Option 2: Deploy từ GitHub (10 phút) 🐙

```bash
# 1. Push code lên GitHub
cd /home/phat/Code/test/chatbot-evaluator-ui
git init
git add .
git commit -m "Chatbot Evaluator MVP"

# Tạo repo mới trên GitHub, sau đó:
git remote add origin https://github.com/YOUR_USERNAME/chatbot-evaluator-ui.git
git branch -M main
git push -u origin main

# 2. Đi tới vercel.com
# 3. Click "New Project"
# 4. Import GitHub repo
# 5. Click "Deploy"
# Done! 🎉
```

---

## ✅ Sau khi deploy thành công

Truy cập URL Vercel đã cho → Bạn sẽ thấy:

1. **Dashboard** - Trang chủ với metrics tổng quan
2. **Campaigns** - 2 campaigns mẫu
3. **Datasets** - 3 datasets mẫu
4. **Evaluations** - Evaluation portal
5. **Comparison** - So sánh chatbots

Tất cả dữ liệu lưu trong **localStorage** của browser.

---

## 🎨 Features có trong MVP

### 1. Dashboard (/)

- Hiển thị tổng quan metrics
- Recent campaigns
- Quick actions

### 2. Campaigns (/campaigns)

- List tất cả campaigns
- Filter by status
- View campaign details
- Xem results (pass rate, quality score, etc.)

### 3. Datasets (/datasets)

- Quản lý test datasets
- View dataset info
- Tags và categories

### 4. Evaluations (/evaluations)

- Evaluation queue (mock data)
- Human review interface
- Statistics

### 5. Comparison (/comparison)

- Select 2 chatbots
- So sánh metrics side-by-side
- Recommendations

---

## 📊 Mock Data có sẵn

Khi mở app lần đầu, sẽ tự động tạo:

**Chatbots:**

- Customer Support Bot v2.1
- Sales Assistant Bot v1.5
- FAQ Bot v3.0

**Campaigns:**

- iPhone 15 Launch Q4 2024 (completed)
- Sales Bot v2.0 Testing (running)

**Datasets:**

- Customer Support Q&A (150 items)
- Product FAQ Dataset (300 items)
- Edge Cases & Error Handling (50 items)

---

## 🛠️ Customization

### Thay đổi mock data

Edit file: `lib/storage.ts` → function `initializeMockData()`

### Thay đổi màu sắc

Edit file: `tailwind.config.ts`

### Thêm pages mới

Tạo folder trong `app/` như: `app/new-page/page.tsx`

---

## 🐛 Troubleshooting

### Không thấy dữ liệu?

- Clear browser cache
- Refresh page (Ctrl+Shift+R)
- Check browser console for errors

### Vercel deploy failed?

- Check `vercel.json` tồn tại
- Ensure no syntax errors (npm run build locally)
- Check Vercel logs

### Styles không đúng?

- Verify `tailwind.config.ts` exists
- Check `globals.css` imported in `layout.tsx`

---

## 📱 Test trên mobile

Mở URL Vercel trên điện thoại → App đã responsive!

---

## 🎯 Next Steps

1. ✅ Test all features
2. ✅ Customize mock data
3. ✅ Share with team
4. ✅ Gather feedback
5. ✅ Plan backend integration (Phase 2)

---

**Chúc mừng! 🎉 App của bạn đã live!**

