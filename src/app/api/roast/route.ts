import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "RoastPage.ai",
  }
});

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ 
        roast: "Missing OPENROUTER_API_KEY. Configure it in Vercel settings." 
      });
    }

    const response = await openai.chat.completions.create({
      model: "google/gemma-3-12b-it:free", 
      messages: [
        {
          role: "system",
          content: `You are a world-class Conversion Rate Optimization (CRO) expert with a brutal, witty, and sarcastic personality. 
          Your goal is to roast landing pages to death but provide high-value, professional advice hidden in the sarcasm.
          
          Guidelines:
          1. Speak in CHINESE (中文).
          2. Use emojis to add character (🔥, 💀, 💩, 🚀).
          3. Critique: Hero section, CTA, Copywriting, and Trust signals.
          4. Be funny but helpful.`
        },
        {
          role: "user",
          content: `Roast this landing page URL: ${url}. 
          
          Format your output like this:
          ### 💀 毒舌评价
          [A hilarious and painful 2-3 sentence roast]
          
          ### 🛠️ 拯救方案
          - **文案修改**: [Concrete suggestion]
          - **设计优化**: [Concrete suggestion]
          - **转化提升**: [Concrete suggestion]
          
          ### 📈 预计提升
          [A sarcastic but optimistic prediction of conversion rate increase]`
        }
      ],
      temperature: 0.8,
    });

    const text = response.choices[0]?.message?.content || "AI 似乎被你的网页烂到了，说不出话来。";

    return NextResponse.json({ roast: text });
  } catch (error: any) {
    console.error("OpenRouter Roast error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to roast the page" 
    }, { status: 500 });
  }
}
