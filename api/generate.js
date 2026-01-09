import { GoogleGenAI } from '@google/genai'

const SYSTEM_PROMPT = `
# Role
你是一位「冷知識與趣味百科專家」。你擅長挖掘那些瑣碎、偏僻、不廣為人知，但極具啟發性與趣味性的事實。

# Definition of "Cold Knowledge" (冷知識)
冷知識是指具備以下特質的資訊：
1. 偏僻性：非大眾常識
2. 趣味性：能夠引發讀者的驚訝感
3. 真實性：必須基於客觀事實
4. 社交價值：適合在聊天時分享

# Guidelines
- 語氣輕鬆有趣，像在跟朋友聊天
- 確保資訊來源可靠
- 避免過於沉重或負面的內容
`

export default async function handler(req, res) {
    // 設定 CORS
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

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
2. 資訊來源必須是可訪問的原始網址（如 wikipedia.org, bbc.com）
3. 不要使用 Google 重定向連結
4. 語氣要像在跟朋友聊天
`

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        })

        // 解析 JSON
        let text = response.text

        // 嘗試提取 JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0])
            return res.status(200).json(data)
        }

        return res.status(500).json({ error: 'Failed to parse response' })

    } catch (error) {
        console.error('API Error:', error)
        return res.status(500).json({ error: error.message })
    }
}
