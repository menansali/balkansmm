'use client';
import Link from 'next/link';
import { ArrowRight, Zap, Shield, TrendingUp, Globe, CreditCard, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import LandingNavbar from '@/components/LandingNavbar';

export default function Home() {
  return (
    <main className="min-h-screen aurora-bg text-white overflow-x-hidden selection:bg-ruby-500/30 selection:text-ruby-200">

      <LandingNavbar />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "BalkanSMM",
            "url": "https://balkansmm.com",
            "logo": "https://balkansmm.com/favicon.ico",
            "description": "The #1 SMM Panel for Instagram, TikTok, and YouTube growth.",
            "sameAs": ["https://twitter.com/balkansmm"]
          })
        }}
      />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 flex flex-col items-center text-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-ruby-900/20 rounded-full blur-[120px] pointer-events-none"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 max-w-5xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs tracking-widest uppercase text-gray-400 mb-8 backdrop-blur-md">
            <div className="flex gap-1">
              <span className="w-1 h-3 bg-ruby-500 rounded-full animate-pulse"></span>
              <span className="w-1 h-2 bg-ruby-500/50 rounded-full"></span>
              <span className="w-1 h-3 bg-ruby-500/30 rounded-full"></span>
            </div>
            <span>v2.0 with AI Tools is Live</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-sans font-medium tracking-tight mb-8 leading-[0.9]">
            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-ruby-400 to-purple-400">Smartest</span> Way <br />
            To Go Viral.
          </h1>

          <p className="max-w-xl mx-auto text-lg text-gray-400 font-light mb-12 leading-relaxed">
            Stop guessing. Use our <span className="text-white font-normal">AI Virality Predictor</span> to optimize your growth.
            Experience the next generation of SMM panels.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href="/register">
              <button className="px-8 py-4 rounded-full bg-white text-black font-medium text-lg hover:scale-105 transition-transform flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                Start Growing <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
            <Link href="/services">
              <button className="px-8 py-4 rounded-full border border-white/10 hover:bg-white/5 transition-colors font-light text-lg backdrop-blur-md">
                View Pricing
              </button>
            </Link>
          </div>

          {/* 3D Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50, rotateX: 10 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="relative mx-auto rounded-3xl border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl shadow-ruby-900/20 overflow-hidden max-w-4xl aspect-[16/9] group"
          >
            {/* Fake UI Header */}
            <div className="h-12 border-b border-white/5 flex items-center px-4 gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20"></div>
              </div>
              <div className="ml-4 h-6 w-64 bg-white/5 rounded-md"></div>
            </div>
            {/* Fake UI Body */}
            <div className="p-6 grid grid-cols-3 gap-6 h-full">
              <div className="col-span-1 space-y-4">
                <div className="h-20 w-full bg-white/5 rounded-xl"></div>
                <div className="h-20 w-full bg-white/5 rounded-xl"></div>
                <div className="h-40 w-full bg-gradient-to-br from-ruby-900/20 to-purple-900/20 rounded-xl border border-ruby-500/20"></div>
              </div>
              <div className="col-span-2 space-y-4">
                <div className="h-32 w-full bg-white/5 rounded-xl"></div>
                <div className="h-64 w-full bg-white/5 rounded-xl"></div>
              </div>
            </div>

            {/* Hover Effect OVerlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-50"></div>
            <div className="absolute bottom-10 left-0 right-0 text-center">
              <span className="px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-sm font-medium">
                Dashboard Preview
              </span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats - Horizontal Strip */}
      <section className="border-y border-white/5 bg-white/[0.02] backdrop-blur-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-wrap justify-between items-center gap-8 text-center md:text-left">
          <Stat label="Total Orders" value="1,240,000+" />
          <div className="h-8 w-px bg-white/10 hidden md:block"></div>
          <Stat label="Starting Rate" value="$0.001" />
          <div className="h-8 w-px bg-white/10 hidden md:block"></div>
          <Stat label="AI Predictions" value="98.5%" />
          <div className="h-8 w-px bg-white/10 hidden md:block"></div>
          <Stat label="Support" value="24/7" />
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-sans font-light mb-4">Engineered for Performance</h2>
            <p className="text-gray-500 font-light">Everything you need to scale your social media empire.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              title="AI Virality"
              desc="Analyze your content before you boost it. Our AI suggests the perfect package."
              icon={Zap}
            />
            <FeatureCard
              title="Drip-Feed & Refill"
              desc="Simulate organic growth with timed delivery and auto-refills for drops."
              icon={TrendingUp}
            />
            <FeatureCard
              title="Developer API"
              desc="Build your own panel. Resell our services with a robust REST API."
              icon={Globe}
            />
            <FeatureCard
              title="Visual Selectors"
              desc="Don't read lists. Use our visual interface to find services instantly."
              icon={CreditCard}
            />
            <FeatureCard
              title="Privacy First"
              desc="We never ask for passwords. Your account security is our priority."
              icon={Shield}
            />
            <FeatureCard
              title="24/7 Expert Support"
              desc="Real humans ready to solve your issues anytime, anywhere."
              icon={Users}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 border-t border-white/5 bg-black/20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-500">Everything you need to know about BalkanSMM.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <FAQItem q="Is it safe for my account?" a="Yes. We use high-quality profiles and natural delivery patterns (drip-feed) to ensure your account remains 100% safe." />
            <FAQItem q="How do I deposit funds?" a="We accept major Cryptocurrencies via Coinbase Commerce. PayPal is available for verified bulk resellers only." />
            <FAQItem q="What if my followers drop?" a="Many of our services come with a 30-day Refill Button. Just click it in your dashboard to restore any lost followers." />
            <FAQItem q="Can I resell your services?" a="Absolutely. We provide a robust API that allows you to connect your own SMM panel and resell our services for a profit." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-gray-600 text-xs tracking-widest uppercase">
            © 2026 BalkanSMM.
          </div>
          <div className="flex gap-8 text-sm font-light text-gray-500">
            <Link href="/blog" className="hover:text-white transition-colors">Blog</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/status" className="hover:text-white transition-colors">Status</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Stat({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex-1 min-w-[150px]">
      <div className="text-3xl font-light text-white mb-1">{value}</div>
      <div className="text-xs font-medium text-gray-500 uppercase tracking-widest">{label}</div>
    </div>
  );
}

function FeatureCard({ title, desc, icon: Icon }: { title: string, desc: string, icon: any }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
      className="group p-8 rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300"
    >
      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-6 text-gray-400 group-hover:text-white group-hover:scale-110 transition-all">
        <Icon size={18} />
      </div>
      <h3 className="text-xl font-light mb-3">{title}</h3>
      <p className="text-sm text-gray-500 font-light leading-relaxed group-hover:text-gray-400 transition-colors">
        {desc}
      </p>
    </motion.div>
  );
}

function FAQItem({ q, a }: { q: string, a: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-ruby-500/30 transition-colors">
      <h3 className="font-medium text-lg mb-2 text-gray-200">{q}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
    </div>
  );
}
