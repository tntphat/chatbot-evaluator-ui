# 🔑 Push với Personal Access Token - 3 Phút

## Bước 1: Tạo Token (1 phút)

1. Mở browser: **https://github.com/settings/tokens/new**

2. Điền form:
   - **Note**: `Chatbot Evaluator Deploy`
   - **Expiration**: `90 days`
   - **Select scopes**: Check ✅ **repo** (cái đầu tiên)
   
3. Scroll xuống → Click **"Generate token"**

4. **COPY TOKEN** (dạng: `ghp_xxxxxxxxxxxxxxxxxxxx`)
   ⚠️ **CHỈ HIỆN 1 LẦN! COPY NGAY!**

---

## Bước 2: Push lên GitHub (1 phút)

Mở terminal và chạy:

```bash
cd /home/phat/Code/test/chatbot-evaluator-ui
git push -u origin main
```

Khi hỏi:
```
Username for 'https://github.com': tntphat
Password for 'https://tntphat@github.com': 
```

**Paste token vào Password** (ghp_xxxxx...)  
⚠️ Không gõ password, paste TOKEN!

Nhấn Enter → Push thành công! ✅

---

## Bước 3: Verify

Check GitHub repo:
**https://github.com/tntphat/chatbot-evaluator-ui**

Refresh → Thấy code! ✅

---

## 🚀 Bước 4: Deploy Vercel (1 phút)

1. Đi tới: **https://vercel.com/new**
2. Login với GitHub
3. Tìm "**chatbot-evaluator-ui**"
4. Click "**Import**"
5. Click "**Deploy**"
6. Đợi 2 phút
7. **Done!** Nhận URL! 🎉

---

## 💡 Quick Copy

**Step 1**: https://github.com/settings/tokens/new  
**Step 2**: 
```bash
cd /home/phat/Code/test/chatbot-evaluator-ui
git push -u origin main
```
**Step 3**: https://github.com/tntphat/chatbot-evaluator-ui  
**Step 4**: https://vercel.com/new

---

**Làm theo thứ tự 1→2→3→4 là xong!** ✅



