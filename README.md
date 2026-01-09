# 🧊 冷知識 App

探索有趣的冷知識，成為聊天話題王！

## 功能特色

- 🎴 **卡片式設計** - 清爽閱讀體驗，一鍵切换
- 📈 **今日熱門** - 自動搜尋 5 個熱門話題，點擊即探索
- ❤️ **收藏夾** - 儲存喜歡的冷知識，隨時回味
- 🎲 **隨機探索** - 沒靈感？隨機看看有趣的知識
- 📱 **手機優先** - 針對行動裝置優化，支援 PWA

## 技術棧

- Vue 3 + Vite
- Pinia (狀態管理)
- Vue Router
- Vercel Serverless Functions
- Gemini API (Gemini 2.5 Flash)

## 本地開發

```bash
# 安裝依賴
npm install

# 啟動開發伺服器
npm run dev

# 建置
npm run build
```

## 環境變數

建立 `.env` 檔案：

```
GEMINI_API_KEY=你的API金鑰
```

## 部署到 Vercel

1. Push 到 GitHub
2. 在 Vercel 匯入專案
3. 設定環境變數 `GEMINI_API_KEY`
4. 部署完成！

## 授權

MIT
