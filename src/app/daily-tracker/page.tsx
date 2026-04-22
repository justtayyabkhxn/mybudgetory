"use client";
import Header from "@/components/Header";
import IMG2 from "../../../public/img2.png";
import Piggy from "../../../public/img3.png";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  PieChart,
  Cloud,
  CalendarCheck,
  Wallet,
  ShieldCheck,
  Smartphone,
  Lock,
  EyeOff,
  Zap,
  BadgeCheck,
  VolumeOff,
  Shield,
  ArrowRight,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import Footer from "@/components/Footer";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-pink-50 to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-black text-gray-800 dark:text-gray-200 px-6 py-5 transition-colors duration-300 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <Header />

        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-8 mt-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 text-indigo-700 dark:text-indigo-300 px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg"
          >
            <Sparkles className="h-4 w-4" />
            Smart Financial Management Made Simple
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-6xl md:text-7xl font-extrabold tracking-tight leading-none"
          >
            Track Budget Efficiently! With{" "}
            <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              MyBudgetory
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            MyBudgetory helps you track your expenses, analyze spending habits,
            and stay financially organized — all in one place.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
          >
            <Image
              src={Piggy}
              alt="Money Management"
              className="mx-auto h-72 w-72 drop-shadow-2xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-8 flex justify-center gap-4"
          >
            <button
              onClick={() =>
                document
                  .getElementById("final-cta")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                Start Managing
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-20 blur-xl transition-opacity"></span>
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="flex justify-center mt-8"
          >
            <ChevronDown className="h-8 w-8 text-indigo-400 animate-bounce" />
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="mt-24 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-indigo-300 dark:via-indigo-700 to-transparent mb-12" />
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Why You&apos;ll Love MyBudgetory
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Powerful features designed to make financial management effortless
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left"
          >
            {[
              {
                icon: Wallet,
                title: "Track Daily Expenses",
                desc: "Log your income and expenses daily with simple category-based inputs.",
                color: "from-emerald-500 to-green-600",
                iconColor: "text-emerald-600 dark:text-emerald-400",
              },
              {
                icon: PieChart,
                title: "Visual Reports",
                desc: "Understand your habits with clear weekly, monthly, and yearly charts.",
                color: "from-purple-500 to-pink-600",
                iconColor: "text-purple-600 dark:text-purple-400",
              },
              {
                icon: Cloud,
                title: "Cloud Synced",
                desc: "Secure cloud storage lets you access data across devices, any time.",
                color: "from-blue-500 to-cyan-600",
                iconColor: "text-blue-600 dark:text-blue-400",
              },
              {
                icon: CalendarCheck,
                title: "Budget Reminders",
                desc: "Set monthly spending goals and get reminders to stay on track.",
                color: "from-pink-500 to-rose-600",
                iconColor: "text-pink-600 dark:text-pink-400",
              },
              {
                icon: ShieldCheck,
                title: "100% Private & Secure",
                desc: "Your data is encrypted, never sold, and only yours to control.",
                color: "from-yellow-500 to-orange-600",
                iconColor: "text-yellow-600 dark:text-yellow-400",
              },
              {
                icon: Smartphone,
                title: "Mobile Friendly",
                desc: "Designed to work perfectly on your phone — track finances on the go!",
                color: "from-indigo-500 to-purple-600",
                iconColor: "text-indigo-600 dark:text-indigo-400",
              },
            ].map((feature, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className={`${feature.iconColor} mb-4`}>
                    <feature.icon className="h-10 w-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mt-16"
        >
          <Image
            src={IMG2}
            alt="Money Management Dashboard"
            width={400}
            height={400}
            className="rounded-3xl shadow-2xl border-4 border-white dark:border-gray-800"
            placeholder="blur"
          />
        </motion.div>

        {/* How It Works Section */}
        <section className="mt-24 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-700 to-transparent mb-12" />
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
              How It Works?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Get started in three simple steps
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left"
          >
            {[
              {
                step: "1",
                title: "Add Transactions",
                detail: "Manually input or upload your daily expenses and incomes.",
                color: "from-indigo-500 to-purple-600",
              },
              {
                step: "2",
                title: "Categorize",
                detail: "Organize entries into categories like food, travel, rent, etc.",
                color: "from-purple-500 to-pink-600",
              },
              {
                step: "3",
                title: "Analyze",
                detail: "Visualize your spending patterns and plan your budget wisely.",
                color: "from-pink-500 to-rose-600",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -8 }}
                transition={{ duration: 0.3 }}
                className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b ${item.color}`} />
                <div className="relative z-10">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br ${item.color} text-white font-bold text-xl mb-4 shadow-lg`}>
                    {item.step}
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    {item.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Testimonials */}
        <section className="mt-24 max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-pink-300 dark:via-pink-700 to-transparent mb-12" />
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              What Users Say?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Join thousands of happy users managing their finances
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            {[
              {
                name: "Ayesha R.",
                feedback: "MyBudgetory has changed how I manage money. I love the clean interface!",
                gradient: "from-indigo-500 to-purple-600",
              },
              {
                name: "Rahul M.",
                feedback: "Finally found an app that makes expense tracking actually fun and useful.",
                gradient: "from-purple-500 to-pink-600",
              },
            ].map((t, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${t.gradient}`} />
                <div className="relative z-10">
                  <div className="text-5xl text-gray-200 dark:text-gray-700 mb-4">"</div>
                  <p className="text-lg text-gray-700 dark:text-gray-300 italic leading-relaxed mb-6">
                    {t.feedback}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                      {t.name.charAt(0)}
                    </div>
                    <p className="font-bold text-gray-900 dark:text-white">
                      {t.name}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Unique Selling Points */}
        <section className="mt-24 max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-700 to-transparent mb-12" />
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Why Choose MyBudgetory?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Unlike other budget apps, we don't just track numbers — we help you
              build smarter habits, take control of your spending, and feel
              confident about your money.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left"
          >
            {[
              {
                icon: BadgeCheck,
                title: "Built for Simplicity",
                desc: "No clutter. No confusing graphs. Just clean budgeting.",
                color: "text-emerald-500 dark:text-emerald-400",
                bg: "from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20",
              },
              {
                icon: Zap,
                title: "Fast and Secure",
                desc: "Lightning-fast performance with full data security.",
                color: "text-indigo-500 dark:text-indigo-400",
                bg: "from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20",
              },
              {
                icon: VolumeOff,
                title: "No Ads. No Noise.",
                desc: "100% focus on your financial goals. No distractions.",
                color: "text-pink-500 dark:text-pink-400",
                bg: "from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20",
              },
              {
                icon: Lock,
                title: "Encrypted Transactions",
                desc: "Every transaction is securely encrypted end-to-end.",
                color: "text-yellow-500 dark:text-yellow-400",
                bg: "from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20",
              },
              {
                icon: EyeOff,
                title: "Full Privacy",
                desc: "Your data is private and never shared or sold.",
                color: "text-purple-500 dark:text-purple-400",
                bg: "from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20",
              },
              {
                icon: Shield,
                title: "AES-256 Encryption",
                desc: "Military-grade AES-256 encryption secures all your sensitive data.",
                color: "text-blue-500 dark:text-blue-400",
                bg: "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                variants={fadeInUp}
                whileHover={{ y: -6, scale: 1.02 }}
                transition={{ duration: 0.3 }}
                className={`group relative bg-gradient-to-br ${item.bg} rounded-3xl p-6 shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 overflow-hidden`}
              >
                <div className="relative z-10">
                  <div className={`${item.color} mb-4`}>
                    <item.icon className="h-8 w-8" />
                  </div>
                  <h3 className={`text-lg font-bold mb-2 ${item.color}`}>
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* FAQ Section */}
        <section className="mt-24 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="h-px bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-700 to-transparent mb-12" />
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-12 text-center">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {[
              {
                q: "Is MyBudgetory free to use?",
                a: "Yes, it's completely free. You can start tracking your expenses right away.",
              },
              {
                q: "Is my data safe?",
                a: "Absolutely. We use encrypted storage and don't share your data with anyone.",
              },
              {
                q: "Can I access it from multiple devices?",
                a: "Yes. Your data is synced across devices as long as you're logged in.",
              },
            ].map((item, i) => (
              <motion.details
                key={i}
                variants={fadeInUp}
                className="group bg-white dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 cursor-pointer transition-all duration-300"
              >
                <summary className="font-bold text-lg text-indigo-600 dark:text-indigo-400 flex items-center justify-between">
                <span>

                  {item.q}
                </span>
                  <ChevronDown className="h-5 w-5 group-open:rotate-180 transition-transform" />
                </summary>
                <p className="mt-4 text-gray-600 dark:text-gray-300 leading-relaxed pl-2 border-l-4 border-indigo-200 dark:border-indigo-800">
                <span>

                  {item.a}
                </span>
                </p>
              </motion.details>
            ))}
          </motion.div>
        </section>

        {/* Final CTA */}
        <section className="mt-24 text-center" id="final-cta">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <div className="h-px bg-gradient-to-r from-transparent via-purple-300 dark:via-purple-700 to-transparent mb-12" />
            
            <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20 rounded-3xl p-12 shadow-2xl border border-indigo-100 dark:border-indigo-800">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
                Ready to master your finances?
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join thousands of users who are taking control of their financial future
              </p>
              <a
                href="/dashboard"
                className="group inline-flex items-center justify-center px-10 py-5 text-xl font-bold text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-2xl shadow-xl hover:shadow-2xl hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  Go to Dashboard
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </a>
            </div>
          </motion.div>
        </section>

        {/* Footer */}
        <Footer />
      </motion.div>
    </main>
  );
}