import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  BarChart3,
  CheckCircle2,
  ArrowRight,
  Zap,
  Globe,
  Database,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";

const templates = [
  {
    id: 'dashboard',
    name: 'Admin Dashboard',
    stack: 'react-fastapi',
    stackLabel: 'React + FastAPI',
    stackColor: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    icon: LayoutDashboard,
    bestFor: 'Analytics, Admin panels, Data visualization',
    description: 'Complete admin dashboard with charts, tables, and real-time data',
    features: ['Interactive Charts', 'Data Tables', 'User Management', 'Dark Mode'],
    prompt: 'Analytics dashboard with user management, real-time charts showing key metrics, data export functionality, and a clean modern UI with dark mode support',
    preview: '📊'
  },
  {
    id: 'blog',
    name: 'Content Platform',
    stack: 'nextjs-supabase',
    stackLabel: 'Next.js + Supabase',
    stackColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    icon: FileText,
    bestFor: 'Blogs, Documentation, CMS',
    description: 'Full-featured content management system with markdown support',
    features: ['Markdown Editor', 'Comments System', 'Categories & Tags', 'SEO Optimized'],
    prompt: 'Blog platform with posts, comments, markdown editor, category filtering, user authentication, and SEO optimization',
    preview: '📝'
  },
  {
    id: 'ecommerce',
    name: 'E-Commerce Store',
    stack: 'vue-express',
    stackLabel: 'Vue + Express',
    stackColor: 'bg-green-500/20 text-green-400 border-green-500/30',
    icon: ShoppingCart,
    bestFor: 'Online stores, Marketplaces, Product catalogs',
    description: 'Complete e-commerce solution with cart and checkout',
    features: ['Product Catalog', 'Shopping Cart', 'Checkout Flow', 'Order History'],
    prompt: 'E-commerce store with product catalog, shopping cart, checkout process, user accounts, order tracking, and payment integration',
    preview: '🛒'
  },
  {
    id: 'data-science',
    name: 'Data Science App',
    stack: 'python-data',
    stackLabel: 'Python Data Science',
    stackColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    icon: BarChart3,
    bestFor: 'ML dashboards, Data analysis, Jupyter-style apps',
    description: 'Data science application with visualization and analysis tools',
    features: ['Data Visualization', 'ML Model Integration', 'Interactive Plots', 'Data Upload'],
    prompt: 'Data science application with CSV upload, data visualization using charts and graphs, statistical analysis, and machine learning model integration',
    preview: '🔬'
  }
];

const Templates = () => {
  const navigate = useNavigate();

  const handleUseTemplate = (prompt: string) => {
    navigate('/lightos/build', { state: { prompt } });
  };

  return (
    <div className="min-h-screen bg-[#0f172a] p-6 overflow-auto">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-white mb-4">Templates</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Start with a proven template and customize it to your needs. 
            Each template comes with best practices and production-ready code.
          </p>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {templates.map((template, i) => (
            <motion.div
              key={template.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-slate-900/50 border-slate-800/50 backdrop-blur-xl overflow-hidden hover:border-indigo-500/30 transition-all duration-300 h-full">
                {/* Preview Header */}
                <div className="h-40 bg-gradient-to-br from-indigo-500/10 to-teal-500/10 flex items-center justify-center relative">
                  <div className="text-6xl">{template.preview}</div>
                  <div className="absolute top-4 right-4">
                    <Badge className={template.stackColor} variant="outline">
                      {template.stackLabel}
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-indigo-500/10">
                      <template.icon className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{template.name}</h3>
                      <p className="text-sm text-slate-500">{template.description}</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Best for</div>
                    <p className="text-sm text-slate-400">{template.bestFor}</p>
                  </div>

                  <div className="mb-6">
                    <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">Features</div>
                    <div className="grid grid-cols-2 gap-2">
                      {template.features.map((feature, j) => (
                        <div key={j} className="flex items-center gap-2 text-sm text-slate-400">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={() => handleUseTemplate(template.prompt)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500"
                  >
                    Use Template
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: Zap, label: 'Instant Setup', desc: 'Ready in seconds' },
            { icon: Globe, label: 'Production Ready', desc: 'Best practices included' },
            { icon: Database, label: 'Full Stack', desc: 'Frontend + Backend' },
            { icon: Lock, label: 'Auth Built-in', desc: 'Secure by default' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
            >
              <Card className="bg-slate-900/30 border-slate-800/50">
                <CardContent className="p-4 text-center">
                  <feature.icon className="h-8 w-8 mx-auto mb-3 text-indigo-400" />
                  <div className="font-medium text-white">{feature.label}</div>
                  <div className="text-sm text-slate-500">{feature.desc}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Templates;
