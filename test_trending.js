import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function test() {
    try {
        const prompt = `
請搜尋今天（台灣時間）的熱門搜尋關鍵字和話題。
請回傳 5 個熱門關鍵字，以 JSON 格式：
{ "topics": ["關鍵字1"] }
only JSON.
`;
        console.log('Testing Trending...');
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        let text = response.text;
        console.log('Response text:', text);

    } catch (e) {
        console.error('Error:', e);
    }
}
test();
