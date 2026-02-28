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
    // 启动无头浏览器
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    
    // 设置视口大小 (桌面端)
    await page.setViewport({ width: 1280, height: 800 });
    
    // 访问页面
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // 截取首屏图片并转为 Base64
    const screenshot = await page.screenshot({ 
      type: 'jpeg', 
      quality: 80,
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

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json({ roast: "请配置 OPENROUTER_API_KEY 以开启视觉评审！" });
    }

    // 1. 执行网页截图 (视觉增强核心)
    console.log(`Capturing ${url}...`);
    const screenshotBase64 = await captureScreenshot(url);

    // 2. 调用多模态 AI (Gemma 3 12B)
    const messages: any[] = [
      {
        role: "system",
        content: `你是一位顶级、毒舌、但极具专业能力的着陆页评审专家 (CRO Expert)。
        你会真实看到网页的截图。
        
        评审准则：
        1. 指出配色、排版、配图上的明显槽点。
        2. 结合文案，分析首屏转化逻辑是否及格。
        3. 说话风格幽默且尖锐，多用表情符号。
        4. 必须使用中文。`
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `请针对这个网址进行视觉评审: ${url}`
          }
        ]
      }
    ];

    // 如果成功获取截图，则将其加入上下文
    if (screenshotBase64) {
      (messages[1].content as any[]).push({
        type: "image_url",
        image_url: {
          url: `data:image/jpeg;base64,${screenshotBase64}`
        }
      });
    }

    const response = await openai.chat.completions.create({
      model: "google/gemma-3-12b-it:free", 
      messages: messages,
      temperature: 0.8,
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
