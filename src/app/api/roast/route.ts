import OpenAI from "openai";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "RoastPage.ai",
  }
});

async function captureScreenshot(url: string) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    // 缩小视口以减小 Payload 体积
    await page.setViewport({ width: 1024, height: 600 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });
    
    // 再次压缩质量到 60
    const screenshot = await page.screenshot({ 
      type: 'jpeg', 
      quality: 60,
      encoding: 'base64' 
    });
    
    return screenshot;
  } catch (error) {
    console.error("Screenshot failed:", error);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    const screenshotBase64 = await captureScreenshot(url);

    const systemPrompt = `你是一位顶级、毒舌、但极具专业能力的着陆页评审专家 (CRO Expert)。
    说话风格幽默尖锐，必须使用中文。输出格式必须包含 ### 💀 毒舌评价、### 🛠️ 拯救方案、### 📈 预计提升。`;

    const userPrompt = `请针对这个网址进行评审: ${url}。如果是图片，请结合视觉设计分析。`;

    // 尝试带图片的请求
    try {
      const messages: any[] = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            ...(screenshotBase64 ? [{
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${screenshotBase64}` }
            }] : [])
          ]
        }
      ];

      const response = await openai.chat.completions.create({
        model: "google/gemma-3-12b-it:free", 
        messages: messages,
        temperature: 0.8,
      });

      return NextResponse.json({ roast: response.choices[0]?.message?.content });
    } catch (aiError: any) {
      console.warn("AI Vision failed, falling back to text-only:", aiError.message);
      
      // Fallback: 纯文本请求（如果 400 错误通常是图片引起的）
      const fallbackResponse = await openai.chat.completions.create({
        model: "google/gemma-3-12b-it:free", 
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.8,
      });

      return NextResponse.json({ roast: fallbackResponse.choices[0]?.message?.content });
    }
  } catch (error: any) {
    console.error("Critical error:", error);
    return NextResponse.json({ error: "评审彻底失败，可能是网络问题。" }, { status: 500 });
  }
}
