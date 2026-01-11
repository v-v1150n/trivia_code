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

// 重試機制：指數退避
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error
            // 若是無法重試的錯誤（如 400），直接拋出
            if (error.message?.includes('API key') || error.message?.includes('Invalid')) {
                throw error
            }
            // 指數退避延遲
            const delay = baseDelay * Math.pow(2, attempt)
            console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }
    throw lastError
}

// 安全解析 JSON
function safeParseJSON(text) {
    // 清理 markdown code blocks
    let cleaned = text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim()

    // 嘗試直接解析
    try {
        return JSON.parse(cleaned)
    } catch (e) {
        // 嘗試提取 JSON 物件
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0])
            } catch (e2) {
                // 嘗試修復常見問題
                let fixed = jsonMatch[0]
                    .replace(/,\s*}/g, '}')      // 移除尾部逗號
                    .replace(/,\s*]/g, ']')     // 移除陣列尾部逗號
                    .replace(/'/g, '"')         // 單引號轉雙引號
                try {
                    return JSON.parse(fixed)
                } catch (e3) {
                    return null
                }
            }
        }
    }
    return null
}

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
        const { keywords = '', count = 3 } = req.body

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
      "content": "冷知識內容，120-150字，內容要豐富具體，生動有趣",
      "whyInteresting": "一句話解釋笑點",
      "icebreaker": "一句開場白",
      "quiz": "一個問題",
      "sourceName": "資料來源 (例如: 維基百科 / Google)",
      "sourceUrl": "具體連結 (若不確定，請回傳 https://www.google.com/search?q={標題} )"
    }
  ]
}

重要規則：
1. 只回傳純 JSON，不要包含任何 markdown 格式或其他文字
2. 內容要真實有趣
3. 語氣要像在跟朋友聊天
`

        // 使用重試機制呼叫 API
        const response = await retryWithBackoff(async () => {
            return await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt
            })
        })

        // 安全解析 JSON
        const data = safeParseJSON(response.text)

        if (data && data.knowledge) {
            return res.status(200).json(data)
        }

        // 如果解析失敗，記錄原始回應以便除錯
        console.error('Failed to parse response:', response.text?.substring(0, 500))
        return res.status(500).json({ error: 'Failed to parse response' })

    } catch (error) {
        console.error('API Error:', error)
        return res.status(500).json({ error: error.message })
    }
}
