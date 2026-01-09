import { GoogleGenAI } from '@google/genai'

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

請回傳 3-5 個熱門關鍵字，以 JSON 格式：
{
  "topics": ["關鍵字1", "關鍵字2", "關鍵字3"]
}

只回傳 JSON，不要其他內容。
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

        // 嘗試從文字中提取關鍵字
        const lines = text.split('\n').filter(l => l.trim())
        const topics = lines.slice(0, 5).map(l => l.replace(/^[\d\.\-\*]+\s*/, '').trim())

        return res.status(200).json({ topics })

    } catch (error) {
        console.error('API Error:', error)
        return res.status(500).json({ error: error.message })
    }
}
