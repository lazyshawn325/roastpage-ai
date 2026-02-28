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
        roast: "请在 Vercel 设置中配置 OPENROUTER_API_KEY 以开启真实 AI 评审！" 
      });
    }

    // 切换至更强大的 Gemma 3 12B 免费模型
    const response = await openai.chat.completions.create({
      model: "google/gemma-3-12b-it:free", 
      messages: [
        {
          role: "system",
          content: `你是一位顶级、毒舌、但极具专业能力的着陆页评审专家 (CRO Expert)。
          你说话风格幽默且尖锐，喜欢指出那些平庸、无聊、转化率低下的设计和文案。
          你需要使用中文进行回复。`
        },
        {
          role: "user",
          content: `请评审这个着陆页 URL: ${url}。
          任务：
          1. 根据典型的创业公司错误（如 H1 文案平淡、CTA 不明显、缺乏社交证明、视觉逻辑混乱等）进行一段毒舌点评（2-3句话）。
          2. 给出现在必须立即修改的 3 个具体建议。
          
          输出格式：
          - 毒舌点评部分
          - 【立即修复】列表`
        }
      ],
    });

    const text = response.choices[0]?.message?.content || "AI 似乎被你的网页烂到了，说不出话来。";

    return NextResponse.json({ roast: text });
  } catch (error: any) {
    console.error("OpenRouter Roast error:", error);
    return NextResponse.json({ 
      error: error.message || "评审失败，AI 正在休息。" 
    }, { status: 500 });
  }
}
