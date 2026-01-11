import { GoogleGenAI } from '@google/genai'

// 重試機制：指數退避
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    let lastError
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn()
        } catch (error) {
            lastError = error
            if (error.message?.includes('API key') || error.message?.includes('Invalid')) {
                throw error
            }
            const delay = baseDelay * Math.pow(2, attempt)
            console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`)
            await new Promise(resolve => setTimeout(resolve, delay))
        }
    }
    throw lastError
}

// 安全解析 JSON
function safeParseJSON(text) {
    let cleaned = text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim()

    try {
        return JSON.parse(cleaned)
    } catch (e) {
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0])
            } catch (e2) {
                let fixed = jsonMatch[0]
                    .replace(/,\s*}/g, '}')
                    .replace(/,\s*]/g, ']')
                    .replace(/'/g, '"')
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
    // API 快取 - 熱門話題每 5 分鐘更新
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return res.status(500).json({ error: 'API key not configured' })
        }

        const ai = new GoogleGenAI({ apiKey })

        const prompt = `
請搜尋今天（台灣時間）的熱門搜尋關鍵字和話題。

請從以下來源綜合整理：
- Google Trends 台灣熱搜
- 社群媒體熱門話題
- 新聞熱點

請回傳 10 個熱門關鍵字，以純 JSON 格式：
{"topics": ["關鍵字1", "關鍵字2", "關鍵字3", "關鍵字4", "關鍵字5", "關鍵字6", "關鍵字7", "關鍵字8", "關鍵字9", "關鍵字10"]}

重要：只回傳純 JSON，不要包含任何 markdown 格式或其他文字。
`

        // 使用重試機制呼叫 API
        const response = await retryWithBackoff(async () => {
            return await ai.models.generateContent({
                model: 'gemini-2.0-flash-lite',
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }]
                }
            })
        })

        // 安全解析 JSON
        const data = safeParseJSON(response.text)

        if (data && data.topics) {
            return res.status(200).json(data)
        }

        // 備用方案：從文字中提取關鍵字
        const text = response.text || ''
        const lines = text.split('\n').filter(l => l.trim())
        const topics = lines.slice(0, 5).map(l => l.replace(/^[\d\.\-\*]+\s*/, '').trim())

        if (topics.length > 0) {
            return res.status(200).json({ topics })
        }

        console.error('Failed to parse trending:', text?.substring(0, 500))
        return res.status(500).json({ error: 'Failed to parse response' })

    } catch (error) {
        console.error('API Error:', error)
        return res.status(500).json({ error: error.message })
    }
}
