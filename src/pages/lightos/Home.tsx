import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Rocket, 
  Code2, 
  Server, 
  Eye, 
  RefreshCw, 
  Sparkles,
  Zap,
  CheckCircle2,
  ArrowRight,
  Terminal,
  Layers
} from "lucide-react";
import { useLightOSStore } from "@/stores/lightosStore";
import { motion } from "framer-motion";

const Home = () => {
  const navigate = useNavigate();
  const [appIdea, setAppIdea] = useState("");
  const { stats } = useLightOSStore();

  const features = [
    { icon: Code2, label: "Code Generation", color: "text-indigo-400" },
    { icon: Server, label: "Build Server", color: "text-teal-400" },
    { icon: Eye, label: "Live Preview", color: "text-purple-400" },
    { icon: RefreshCw, label: "Hot Reload", color: "text-emerald-400" },
    { icon: Sparkles, label: "AI Auto-Fix", color: "text-amber-400" },
  ];

  const handleBuildApp = () => {
    if (appIdea.trim()) {
      navigate("/lightos/build", { state: { prompt: appIdea } });
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] overflow-auto">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
            <Zap className="h-4 w-4 text-indigo-400" />
            <span className="text-sm text-indigo-300">Autonomous Development Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
              Build Apps from
            </span>
            <br />
            <span className="text-white">Single Prompts</span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-8">
            AI-powered development with integrated build server & live preview.
            Describe your idea, watch it come to life.
          </p>

          {/* Feature badges */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {features.map((feature, i) => (
              <motion.div
                key={feature.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Badge 
                  variant="outline" 
                  className="px-4 py-2 bg-slate-800/50 border-slate-700/50 backdrop-blur-sm"
                >
                  <CheckCircle2 className={`h-3.5 w-3.5 mr-2 ${feature.color}`} />
                  <span className="text-slate-300">{feature.label}</span>
                </Badge>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Start Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-3xl mx-auto mb-16"
        >
          <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-teal-500/5" />
            <CardContent className="relative p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-indigo-500/10">
                  <Terminal className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Quick Start</h2>
                  <p className="text-sm text-slate-500">Describe your app idea in natural language</p>
                </div>
              </div>

              <Textarea
                value={appIdea}
                onChange={(e) => setAppIdea(e.target.value)}
                placeholder="Build a todo app with user authentication, CRUD operations, and a clean minimal UI..."
                className="min-h-[120px] bg-slate-950/50 border-slate-700/50 text-slate-200 placeholder:text-slate-600 resize-none mb-6 focus:border-indigo-500/50 focus:ring-indigo-500/20"
              />

              <Button 
                onClick={handleBuildApp}
                disabled={!appIdea.trim()}
                className="w-full h-12 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white font-semibold shadow-lg shadow-indigo-500/20 transition-all duration-300"
              >
                <Rocket className="h-5 w-5 mr-2" />
                Build App
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>

              <p className="text-center text-xs text-slate-600 mt-4">
                Powered by advanced AI models • Average build time: ~45 seconds
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          <Card className="bg-slate-900/30 border-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="inline-flex p-3 rounded-xl bg-indigo-500/10 mb-4">
                <Layers className="h-6 w-6 text-indigo-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.totalApps.toLocaleString() || "1,247"}
              </div>
              <div className="text-sm text-slate-500">Total Apps Built</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/30 border-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="inline-flex p-3 rounded-xl bg-emerald-500/10 mb-4">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {stats.successRate.toFixed(1) || "98.5"}%
              </div>
              <div className="text-sm text-slate-500">Success Rate</div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/30 border-slate-800/50 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="inline-flex p-3 rounded-xl bg-teal-500/10 mb-4">
                <Zap className="h-6 w-6 text-teal-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">
                {Math.round(stats.avgBuildTime) || "45"}s
              </div>
              <div className="text-sm text-slate-500">Avg Build Time</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
