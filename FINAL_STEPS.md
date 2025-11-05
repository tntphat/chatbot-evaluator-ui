# ✅ Final Steps - Copy & Paste

## 🎯 Bạn làm theo thứ tự này:

---

### Step 1: Tạo Personal Access Token

**Mở browser và làm theo:**

1. **Đi tới**: https://github.com/settings/tokens/new

2. **Điền**:
   - Note: `Chatbot Evaluator Deploy`
   - Expiration: `90 days`
   
3. **Check**: ✅ `repo` (cái đầu tiên trong list)

4. **Click**: "Generate token" ở cuối trang

5. **COPY TOKEN** - Dạng: `ghp_abcdefghijklmnopqrstuvwxyz1234567890`
   
   ⚠️ **LƯU Ý**: Token chỉ hiện 1 lần! Copy ngay!

---

### Step 2: Push lên GitHub

**Mở terminal và chạy:**

```bash
cd /home/phat/Code/test/chatbot-evaluator-ui
git push -u origin main
```

**Khi terminal hỏi:**
```
Username for 'https://github.com': tntphat
Password for 'https://tntphat@github.com': [PASTE TOKEN VÀO ĐÂY]
```

⚠️ **Password = TOKEN (không phải password GitHub của bạn!)**

Nhấn Enter → Sẽ thấy:
```
Enumerating objects: 50, done.
...
To https://github.com/tntphat/chatbot-evaluator-ui.git
 * [new branch]      main -> main
```

✅ **Thành công!**

---

### Step 3: Verify trên GitHub

Mở browser:
**https://github.com/tntphat/chatbot-evaluator-ui**

Refresh → Thấy tất cả code! ✅

---

### Step 4: Deploy trên Vercel

**Mở browser:**

1. **Đi tới**: https://vercel.com/new

2. **Login** với GitHub (nếu chưa)

3. **Tìm repo** "chatbot-evaluator-ui"

4. **Click** "Import" bên cạnh repo

5. **Settings** (để nguyên mặc định):
   - Framework Preset: Next.js ✅
   - Root Directory: `./` ✅
   - Build Command: `npm run build` ✅
   
6. **Click** "Deploy" (nút xanh lớn)

7. **Đợi** 2-3 phút → Thấy confetti animation 🎉

8. **Click** "Visit" hoặc copy URL!

---

## 🎉 Kết quả

Bạn sẽ có:
- ✅ Code trên GitHub: https://github.com/tntphat/chatbot-evaluator-ui
- ✅ App live: https://chatbot-evaluator-ui-xxx.vercel.app
- ✅ Auto-deploy: Mỗi lần push code = auto deploy!

---

## 🚀 Summary - 4 Bước

1. ✅ Tạo token: https://github.com/settings/tokens/new
2. ✅ Push: `git push -u origin main` (paste token)
3. ✅ Verify: https://github.com/tntphat/chatbot-evaluator-ui
4. ✅ Deploy: https://vercel.com/new

**Total time: 5 phút**

---

**BẮT ĐẦU TỪ STEP 1 NHÉ!** 🚀

Sau khi push xong (Step 2), báo tôi → tôi sẽ giúp deploy Vercel! 😊




