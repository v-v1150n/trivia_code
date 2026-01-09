import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { GoogleGenAI } from '@google/genai'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const SYSTEM_PROMPT = `
# Role
你是一位「冷知識與趣味百科專家」。你擅長挖掘那些瑣碎、偏僻、不廣為人知，但極具啟發性與趣味性的事實。

# Guidelines
- 語氣輕鬆有趣，像在跟朋友聊天
- 確保資訊來源可靠
- 避免過於沉重或負面的內容
`

// 生成冷知識 API
app.post('/api/generate', async (req, res) => {
    try {
        const { keywords = '', count = 1 } = req.body

        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' })
        }

        const ai = new GoogleGenAI({ apiKey })

        const topicText = keywords ? `關於「${keywords}」的` : '跨領域、跨文化的隨機'

        const prompt = `
${SYSTEM_PROMPT}

# 任務
請提供 ${count} 則${topicText}冷知識。

# 輸出格式
請以 JSON 格式回覆，格式如下：
{
  "knowledge": [
    {
      "title": "有趣的標題",
      "category": "🔬科學 / 📜歷史 / 🎭文化 / 🐾動物 / 🌍地理 / 💬語言 / 🍽️飲食 / 💻科技",
      "content": "冷知識內容，80-120字，輕鬆口語風格",
      "whyInteresting": "為什麼這個知識很有梗，1-2句話",
      "icebreaker": "可以直接拿去跟朋友說的開場白",
      "quiz": "一個可以拿去考朋友的問題",
      "sourceName": "來源網站名稱",
      "sourceUrl": "完整可訪問的原始網址"
    }
  ]
}

重要規則：
1. 只回傳 JSON，不要其他文字
2. 資訊來源必須是可訪問的原始網址
3. 語氣要像在跟朋友聊天
`

        console.log(`🔍 搜尋冷知識: ${keywords || '隨機'}`)

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        })

        let text = response.text
        console.log('📝 API 回應:', text.substring(0, 200) + '...')

        // 嘗試提取 JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0])
            console.log(`✅ 成功解析 ${data.knowledge?.length || 0} 則冷知識`)
            return res.json(data)
        }

        return res.status(500).json({ error: 'Failed to parse response' })

    } catch (error) {
        console.error('❌ API Error:', error.message)
        return res.status(500).json({ error: error.message })
    }
})

// 取得熱門話題 API
app.post('/api/trending', async (req, res) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' })
        }

        const ai = new GoogleGenAI({ apiKey })

        const prompt = `
請搜尋今天（台灣時間）的熱門搜尋關鍵字和話題。

請回傳 3-5 個熱門關鍵字，以 JSON 格式：
{
  "topics": ["關鍵字1", "關鍵字2", "關鍵字3"]
}

只回傳 JSON，不要其他內容。
`

        console.log('📈 搜尋熱門話題...')

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        })

        let text = response.text

        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0])
            console.log(`✅ 熱門話題:`, data.topics)
            return res.json(data)
        }

        return res.status(500).json({ error: 'Failed to parse response' })

    } catch (error) {
        console.error('❌ API Error:', error.message)
        return res.status(500).json({ error: error.message })
    }
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`
🧊 冷知識 API Server 運行中
📍 http://localhost:${PORT}

API 端點:
  POST /api/generate  - 生成冷知識
  POST /api/trending  - 取得熱門話題
  `)
})
