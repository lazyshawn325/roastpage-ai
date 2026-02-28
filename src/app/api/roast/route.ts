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
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 25000 });
    
    // 1. 提取关键元数据 (这就是用户截图做不到的)
    const metadata = await page.evaluate(() => {
      return {
        title: document.title,
        h1: document.querySelector('h1')?.innerText || "未找到 H1 标签",
        description: document.querySelector('meta[name="description"]')?.getAttribute('content') || "未配置 Meta Description",
        scriptsCount: document.querySelectorAll('script').length,
        imagesWithoutAlt: Array.from(document.querySelectorAll('img')).filter(img => !img.alt).length
      };
    });

    // 2. 截图 (低质量、小尺寸以保证 Payload 兼容)
    const screenshot = await page.screenshot({ 
      type: 'jpeg', 
      quality: 50,
      encoding: 'base64' 
    });
    
    return { screenshot, metadata };
  } catch (error) {
    console.error("Analysis failed:", error);
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
    
    评审准则：
    1. 结合视觉截图和提取的代码元数据。
    2. 毫不留情地指出文案烂、设计丑、代码乱的地方。
    3. 必须使用中文，输出格式必须严谨包含 ### 💀 毒舌评价、### 🛠️ 拯救方案、### 📈 预计提升。`;

    const metadataContext = analysis?.metadata ? `
    [底层代码审计数据]:
    - 页面标题: ${analysis.metadata.title}
    - H1 标签内容: ${analysis.metadata.h1}
    - Meta 描述: ${analysis.metadata.description}
    - 脚本加载数量: ${analysis.metadata.scriptsCount} (越多越慢)
    - 缺少 Alt 标签的图片: ${analysis.metadata.imagesWithoutAlt}
    ` : "未能提取到代码数据";

    const userPrompt = `请评审这个网址: ${url}。
    ${metadataContext}
    请根据这些‘X光’数据和视觉截图进行深度轰炸。`;

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
      // Fallback logic
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
    return NextResponse.json({ error: "X光分析失败，请检查网址是否可访问。" }, { status: 500 });
  }
}
