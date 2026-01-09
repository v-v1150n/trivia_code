import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

async function test() {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: 'Hello'
        });
        console.log('Full Response Keys:', Object.keys(response));
        console.log('Type of response.text:', typeof response.text);

        try {
            console.log('Trying as function:', response.text());
        } catch (e) {
            console.log('Not a function:', e.message);
        }

        console.log('Value as property:', response.text);

    } catch (e) {
        console.error('Error:', e);
    }
}
test();
