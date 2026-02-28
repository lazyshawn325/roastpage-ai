"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Flame, Globe, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [url, setUrl] = useState("");
  const [isRoasting, setIsRoasting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleRoast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    // 自动补全 https:// 协议头
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

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-50 flex flex-col items-center selection:bg-orange-500/30">
      {/* Background Gradients */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-900/20 via-neutral-950 to-neutral-950 -z-10" />

      <main className="flex-1 w-full max-w-4xl px-4 py-24 flex flex-col items-center text-center">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-8"
        >
          <Flame size={16} />
          <span className="text-sm font-medium">AI Landing Page Roaster</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60"
        >
          Your Landing Page <br className="hidden md:block" />
          <span className="text-orange-500">Probably Sucks.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-neutral-400 max-w-2xl mb-12"
        >
          Enter your URL below. Our AI CRO expert will aggressively tear down your design, copy, and UX—then tell you exactly how to fix it and get more conversions.
        </motion.p>

        <motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          onSubmit={handleRoast} 
          className="flex flex-col sm:flex-row gap-3 w-full max-w-lg mb-16 relative"
        >
          <div className="relative flex-1">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 h-5 w-5" />
            <Input 
              type="text" 
              placeholder="yourstartup.com" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="pl-10 h-12 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500 focus-visible:ring-orange-500"
            />
          </div>
          <Button 
            type="submit" 
            disabled={isRoasting}
            className="h-12 px-8 bg-orange-600 hover:bg-orange-700 text-white font-semibold transition-all shadow-[0_0_20px_rgba(234,88,12,0.3)] hover:shadow-[0_0_30px_rgba(234,88,12,0.5)]"
          >
            {isRoasting ? (
              <span className="flex items-center gap-2">
                <Sparkles className="animate-spin h-4 w-4" />
                Roasting...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Roast Me <ArrowRight size={18} />
              </span>
            )}
          </Button>
        </motion.form>

        {/* Error Handling */}
        {error && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            className="flex items-center gap-2 text-red-400 mb-8 bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20"
          >
            <AlertCircle size={18} />
            <span className="text-sm">{error}</span>
          </motion.div>
        )}

        {/* Results Area */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-2xl text-left"
          >
            <Card className="bg-neutral-900/50 border-neutral-800 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-500">
                  <Flame size={20} />
                  The Verdict
                </CardTitle>
                <CardDescription className="text-neutral-400">Brutal honesty incoming.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-neutral-200 leading-relaxed text-lg whitespace-pre-wrap italic">
                  "{result}"
                </div>
                <div className="mt-6 pt-6 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <p className="text-sm text-neutral-500">Want the full 10-page CRO breakdown PDF?</p>
                  <Button variant="outline" className="border-orange-500/30 text-orange-400 hover:bg-orange-500/10 whitespace-nowrap">
                    Get Deep Dive ($9)
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </main>

      <footer className="py-6 text-neutral-600 text-sm">
        Built with ❤️ by RoastPage.ai | Powered by Gemini
      </footer>
    </div>
  );
}
