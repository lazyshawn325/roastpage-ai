"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Flame, Globe, Sparkles, AlertCircle, Share2, Twitter, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";

const LOADING_MESSAGES = [
  "正在忍受你那平庸的文案...",
  "正在分析你那 2005 年风格的设计...",
  "正在寻找你那根本不存在的社交证明...",
  "正在试图理解你的 H1 到底想说什么...",
  "正在计算由于 UX 混乱导致的损失...",
  "正在为你的转化率默哀...",
];

export default function Home() {
  const [url, setUrl] = useState("");
  const [isRoasting, setIsRoasting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadingMsg, setLoadingMsg] = useState(LOADING_MESSAGES[0]);

  useEffect(() => {
    let interval: any;
    if (isRoasting) {
      interval = setInterval(() => {
        setLoadingMsg(LOADING_MESSAGES[Math.floor(Math.random() * LOADING_MESSAGES.length)]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isRoasting]);

  const handleRoast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = `https://${cleanUrl}`;
    }
    
    setIsRoasting(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to roast");
      setResult(data.roast);
    } catch (err: any) {
      setError(err.message || "Something went wrong. The AI might be on a coffee break.");
    } finally {
      setIsRoasting(false);
    }
  };

  const handleShare = () => {
    const text = `我的网页被 RoastPage.ai 狠狠吐槽了！来看看 AI 是怎么说的：${url}`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(twitterUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-50 flex flex-col items-center selection:bg-orange-500/30 font-sans">
      {/* Background Flow Logic */}
      <div className="fixed inset-0 overflow-hidden -z-10">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
      </div>

      {/* Navbar */}
      <nav className="w-full max-w-6xl px-6 py-6 flex justify-between items-center backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tighter">
          <div className="bg-orange-600 p-1.5 rounded-lg shadow-[0_0_15px_rgba(234,88,12,0.5)]">
            <Flame size={20} className="text-white" />
          </div>
          RoastPage<span className="text-orange-500">.ai</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-medium text-neutral-400">
          <a href="#" className="hover:text-white transition-colors">Pricing</a>
          <a href="#" className="hover:text-white transition-colors">Examples</a>
          <Button variant="outline" className="border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800 text-white border-white/5">
            Sign In
          </Button>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-4xl px-4 py-20 flex flex-col items-center text-center">
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-10"
        >
          <Sparkles size={14} />
          <span className="text-xs font-bold uppercase tracking-wider">Powered by Gemini 1.5 & Gemma 3</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-black tracking-tight mb-8 bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-white/40 leading-[1.1]"
        >
          你的着陆页 <br />
          <span className="text-orange-500 underline decoration-orange-500/30 underline-offset-8">可能真的很烂</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-12 leading-relaxed"
        >
          输入你的 URL。我们的 AI CRO 专家将发起无情的视觉与文案轰炸，然后告诉你如何修复它以获取 10 倍的转化。
        </motion.p>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          onSubmit={handleRoast} 
          className="flex flex-col sm:flex-row gap-4 w-full max-w-xl mb-20 relative group"
        >
          <div className="relative flex-1">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-orange-500 transition-colors h-5 w-5" />
            <Input 
              type="text" 
              placeholder="输入你的产品网址 (e.g. google.com)" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="pl-12 h-14 bg-neutral-900/80 border-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-2 focus-visible:ring-orange-500 rounded-2xl text-lg backdrop-blur-sm"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isRoasting}
            className="h-14 px-10 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-2xl transition-all shadow-[0_0_30px_rgba(234,88,12,0.2)] hover:shadow-[0_0_40px_rgba(234,88,12,0.4)] active:scale-95 disabled:opacity-50"
          >
            {isRoasting ? (
              <span className="flex items-center gap-3">
                <Sparkles className="animate-spin h-5 w-5" />
                正在轰炸中...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                狠狠吐槽 <ArrowRight size={20} />
              </span>
            )}
          </Button>
        </motion.form>

        <AnimatePresence mode="wait">
          {isRoasting && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 mb-12"
            >
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1, delay: i * 0.2 }}
                    className="w-2 h-2 bg-orange-500 rounded-full"
                  />
                ))}
              </div>
              <p className="text-orange-400 font-medium italic text-lg">{loadingMsg}</p>
            </motion.div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="flex items-center gap-3 text-red-400 mb-12 bg-red-400/5 px-6 py-3 rounded-2xl border border-red-400/10 shadow-sm"
            >
              <AlertCircle size={20} />
              <span className="font-medium">{error}</span>
            </motion.div>
          )}

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="w-full max-w-3xl text-left relative"
            >
              {/* Highlight Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-amber-600 rounded-3xl blur opacity-20" />
              
              <Card className="bg-neutral-900/90 border-neutral-800 backdrop-blur-2xl rounded-3xl relative overflow-hidden">
                <CardHeader className="border-b border-neutral-800/50 pb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2 text-orange-500 text-2xl font-black">
                        <Flame size={24} className="fill-orange-500" />
                        AI 评审报告
                      </CardTitle>
                      <CardDescription className="text-neutral-400 mt-1 font-medium">针对 {url} 的毒舌诊断已生成</CardDescription>
                    </div>
                    <Button onClick={handleShare} size="sm" variant="ghost" className="text-neutral-400 hover:text-white hover:bg-white/5 rounded-xl gap-2">
                      <Twitter size={16} />
                      分享结果
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-8 px-8 pb-10">
                  <div className="prose prose-invert prose-orange max-w-none 
                    prose-headings:font-black prose-headings:tracking-tight
                    prose-p:text-neutral-300 prose-p:leading-relaxed prose-p:text-lg
                    prose-strong:text-orange-400 prose-strong:font-bold
                    prose-li:text-neutral-300 prose-li:text-lg
                  ">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-neutral-800/50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-green-500/10 p-3 rounded-2xl text-green-500">
                        <TrendingUp size={24} />
                      </div>
                      <div>
                        <p className="text-sm text-neutral-500 font-bold uppercase tracking-widest">潜在提升空间</p>
                        <p className="text-2xl font-black text-white">+240% <span className="text-neutral-500 text-sm font-medium">转化率预计</span></p>
                      </div>
                    </div>
                    <Button className="w-full md:w-auto px-8 bg-white hover:bg-neutral-200 text-black font-black py-6 rounded-2xl text-lg shadow-xl shadow-white/10 transition-transform active:scale-95">
                      获取 10 页深度诊断报告 ($9)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Benefits Section */}
        <section className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full">
          {[
            { icon: <Flame />, title: "无情轰炸", desc: "AI 不会客气，它会指出每一个让用户想逃跑的设计缺陷。" },
            { icon: <TrendingUp />, title: "真实转化", desc: "所有的吐槽都基于成熟的 CRO 模型，直接指向您的钱包。" },
            { icon: <Share2 />, title: "病毒传播", desc: "分享你的‘被虐’经历到社交媒体，为你的产品引流。" }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-3xl border border-neutral-800/50 bg-neutral-900/30 hover:bg-neutral-900/50 transition-colors group">
              <div className="mb-4 text-orange-500 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
              <h3 className="text-xl font-bold mb-2">{item.title}</h3>
              <p className="text-neutral-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="w-full max-w-6xl px-6 py-12 border-t border-neutral-900 mt-20 flex flex-col md:flex-row justify-between items-center text-neutral-500 gap-6 text-sm">
        <div>© 2026 RoastPage.ai. 不要在垃圾设计上浪费生命。</div>
        <div className="flex gap-8">
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
          <a href="#" className="hover:text-white">Twitter</a>
        </div>
      </footer>
    </div>
  );
}
