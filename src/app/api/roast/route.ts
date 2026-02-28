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

async function captureAndExtract(url: string) {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      ],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    
    // 增加对 GitHub 等防爬站点的处理
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
    
    const metadata = await page.evaluate(() => {
      return {
        title: document.title || "无标题",
        h1: document.querySelector('h1')?.innerText || "未找到 H1",
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || "未配置描述",
        scriptsCount: document.querySelectorAll('script').length,
        imagesWithoutAlt: Array.from(document.querySelectorAll('img')).filter(img => !img.alt).length
      };
    });

    const screenshot = await page.screenshot({ 
      type: 'jpeg', 
      quality: 40,
      encoding: 'base64' 
    });
    
    return { screenshot, metadata };
  } catch (error) {
    console.error("Analysis failed, proceeding with text-only mode:", error);
    return null;
  } finally {
    if (browser) await browser.close();
  }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    const analysis = await captureAndExtract(url);

    const systemPrompt = `你是一位顶级、毒舌、但极具专业能力的着陆页评审专家 (CRO Expert)。
    你拥有‘X光视力’，能同时看到网页的视觉设计和底层代码。
    必须使用中文，输出格式必须严谨包含 ### 💀 毒舌评价、### 🛠️ 拯救方案、### 📈 预计提升。`;

    // 核心修复点：使用可选链避免崩溃
    const metadataContext = analysis ? `
    [底层代码审计数据]:
    - 页面标题: ${analysis.metadata?.title}
    - H1 标签内容: ${analysis.metadata?.h1}
    - Meta 描述: ${analysis.metadata?.description}
    - 脚本加载数量: ${analysis.metadata?.scriptsCount}
    - 缺少 Alt 标签的图片: ${analysis.metadata?.imagesWithoutAlt}
    ` : `[警告]: 无法直接抓取该站点（可能有反爬虫）。请根据你对该知名站点 ${url} 的通用印象进行吐槽。`;

    const userPrompt = `请评审这个网址: ${url}。
    ${metadataContext}
    请进行深度轰炸。`;

    try {
      const messages: any[] = [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "text", text: userPrompt },
            ...(analysis?.screenshot ? [{
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${analysis.screenshot}` }
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
      console.error("AI Error:", aiError.message);
      // 最后的兜底逻辑：纯文本请求
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
    console.error("Outer Error:", error);
    return NextResponse.json({ error: "服务器内部错误，AI 被气晕了。" }, { status: 500 });
  }
}
