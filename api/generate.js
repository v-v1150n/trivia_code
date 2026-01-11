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

        // 隨機主題種子 - 大幅擴充以減少重複
        const randomCategories = [
            // 動物相關
            '貓咪', '狗狗', '鳥類', '魚類', '鯊魚', '鯨魚', '海豚', '章魚', '水母',
            '蜜蜂', '螞蟻', '蝴蝶', '蜘蛛', '蛇', '青蛙', '烏龜', '恐龍', '猛瑪象',
            // 科學
            '黑洞', '星球', '銀河系', '外星人', '量子力學', '相對論', '化學反應',
            'DNA', '細胞', '病毒', '細菌', '疫苗',
            // 人體
            '大腦', '心臟', '眼睛', '耳朵', '皮膚', '骨骼', '血液', '睡眠', '夢境',
            // 歷史
            '埃及', '羅馬', '希臘', '中國古代', '日本武士', '維京人', '馬雅文明', '印加帝國',
            '世界大戰', '冷戰', '工業革命', '文藝復興',
            // 地理
            '火山', '地震', '海嘯', '極光', '沙漠', '雨林', '北極', '南極', '深海',
            '喜馬拉雅山', '亞馬遜河', '撒哈拉沙漠',
            // 飲食
            '咖啡', '茶葉', '巧克力', '起司', '壽司', '拉麵', '披薩', '漢堡', '冰淇淋',
            '辣椒', '香料', '發酵食品',
            // 科技
            '網際網路', '智慧手機', '電腦', '機器人', '無人機', '電動車', '太空探索',
            '虛擬實境', '區塊鏈', 'AI人工智慧',
            // 藝術文化
            '電影', '音樂', '繪畫', '雕塑', '攝影', '舞蹈', '戲劇', '動漫', '電玩',
            // 語言文字
            '中文', '英文', '日文', '表情符號', '密碼學', '手語',
            // 運動
            '足球', '籃球', '棒球', '網球', '游泳', '馬拉松', '滑雪', '衝浪', '攀岩',
            // 其他
            '數學', '哲學', '心理學', '經濟學', '時尚', '建築', '交通工具', '節日慶典'
        ]

        let topicText
        if (keywords) {
            topicText = `關於「${keywords}」的`
        } else {
            // 隨機選擇 1-2 個領域，加入時間戳增加變化
            const seed = Date.now()
            const shuffled = randomCategories.sort(() => Math.sin(seed * Math.random()) - 0.5)
            const numPicks = Math.floor(Math.random() * 2) + 1
            const picked = shuffled.slice(0, numPicks).join('、')
            topicText = `關於「${picked}」的獨特且鮮為人知的`
        }

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

        // 使用重試機制呼叫 API（含 Google Search grounding）
        const response = await retryWithBackoff(async () => {
            return await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }]
                }
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
