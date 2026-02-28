import OpenAI from "openai";
import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY || "",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    "X-Title": "RoastPage.ai",
  }
});

// 100% 兼容 Vercel 的轻量级网页分析逻辑
async function analyzePage(url: string) {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      next: { revalidate: 3600 } // 缓存 1 小时
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    
    const html = await response.text();
    const $ = cheerio.load(html);

    return {
      title: $("title").text() || "无标题",
      h1: $("h1").first().text() || "未找到 H1 标签",
      description: $('meta[name="description"]').attr("content") || "未配置描述",
      keywords: $('meta[name="keywords"]').attr("content") || "无关键词",
      imagesCount: $("img").length,
      imagesWithoutAlt: $("img:not([alt])").length,
      scriptsCount: $("script").length,
    };
  } catch (error) {
    console.error("Fetch analysis failed:", error);
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    // 执行轻量级审计
    const metadata = await analyzePage(url);

    const systemPrompt = `你是一位顶级、毒舌、但极具专业能力的着陆页评审专家 (CRO Expert)。
    你拥有‘代码透视眼’，能通过底层数据一眼看穿一个网页的平庸。
    必须使用中文，输出格式必须严谨包含 ### 💀 毒舌评价、### 🛠️ 拯救方案、### 📈 预计提升。`;

    const context = metadata ? `
    [底层代码审计结果]:
    - 标题: ${metadata.title}
    - 核心 H1: ${metadata.h1}
    - SEO 描述: ${metadata.description}
    - 页面图片总数: ${metadata.imagesCount}
    - 垃圾图片(无Alt): ${metadata.imagesWithoutAlt}
    - 脚本负担: ${metadata.scriptsCount}
    ` : `[警告]: 无法直接抓取该站点（可能有严格屏蔽）。请根据你对该网址 ${url} 的通用印象进行专业吐槽。`;

    const userPrompt = `请评审这个网址: ${url}。
    ${context}
    任务：请从 CRO (转化率) 和 SEO (搜索引擎优化) 两个维度进行无情轰炸。`;

    // 调用 OpenRouter 
    const response = await openai.chat.completions.create({
      model: "google/gemma-3-12b-it:free", 
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.8,
    });

    const roastText = response.choices[0]?.message?.content || "AI 被你的网页代码气到自闭了。";

    return NextResponse.json({ roast: roastText });
  } catch (error: any) {
    console.error("Final Error:", error);
    return NextResponse.json({ error: "由于该网站防火墙太厚或 API 拥堵，评审暂时中断。" }, { status: 500 });
  }
}
