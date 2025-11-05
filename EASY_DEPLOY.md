# 🚀 3 Bước Deploy Siêu Nhanh

## Bước 1: Tạo Personal Access Token (2 phút) 🔑

1. Mở browser → https://github.com/settings/tokens
2. Click "**Generate new token**" → "**Generate new token (classic)**"
3. Note: "Chatbot Evaluator Deploy"
4. Expiration: **90 days**
5. Check ✅ **repo** (full control)
6. Scroll xuống → Click "**Generate token**"
7. **COPY TOKEN** (dạng: `ghp_xxxxxxxxxxxxx`) - chỉ hiện 1 lần!

---

## Bước 2: Push lên GitHub (1 phút) 📤

Mở terminal và chạy:

```bash
cd /home/phat/Code/test/chatbot-evaluator-ui
git push -u origin main
```

Khi hỏi:
- **Username**: `tntphat`
- **Password**: Paste token bạn vừa copy (ghp_xxxxx...)

Enter → Done! ✅

---

## Bước 3: Deploy trên Vercel (2 phút) 🌐

1. Mở browser → https://vercel.com
2. Login với GitHub
3. Click "**Add New...**" → "**Project**"
4. Tìm "**chatbot-evaluator-ui**" → Click "**Import**"
5. Để nguyên default settings
6. Click "**Deploy**"
7. Đợi 2-3 phút
8. **Done!** 🎉

Nhận URL: `https://chatbot-evaluator-ui-xxx.vercel.app`

---

## ✅ Xong! Chỉ 3 bước

**Total time**: ~5 phút  
**Result**: App live trên internet!

---

## 🎯 Nếu gặp vấn đề

### "Token not working"
- Đảm bảo check ✅ **repo** scope khi tạo token
- Copy đúng toàn bộ token (bắt đầu với `ghp_`)

### "Repository not found"
- Check repo tồn tại: https://github.com/tntphat/chatbot-evaluator-ui
- Đảm bảo username chính xác: `tntphat`

---

**Bắt đầu từ Bước 1 nhé!** 🚀


