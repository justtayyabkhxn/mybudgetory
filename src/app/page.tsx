"use client";

import Header from "@/components/Header";
import Image from "next/image";
import Link from "next/link";
import Piggy from "../../public/piggy.png";
import {
  Wallet,
  Plane,
  TrendingUp,
  CalendarCheck,
  ShieldCheck,
  Smile,
  Github,
  Play,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { JSX } from "react";
import Footer from "@/components/Footer";
import SlideUp from "@/components/SlideUp";
import { motion } from "framer-motion";

type Feature = {
  icon: JSX.Element;
  title: string;
  desc: string;
};

type Mode = {
  href: string;
  icon: JSX.Element;
  title: string;
  bg: string;
  color: string;
  desc: string;
};

type Testimonial = {
  text: string;
  author: string;
};

// Feature Cards
const features = [
  {
    icon: (
      <TrendingUp className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
    ),
    title: "Smart Analytics",
    desc: "Track trends, analyze patterns, and get insights to improve your savings.",
  },
  {
    icon: (
      <CalendarCheck className="h-8 w-8 text-pink-600 dark:text-pink-400" />
    ),
    title: "Goal Planning",
    desc: "Set expense limits or plan for future events with budget milestones.",
  },
  {
    icon: (
      <ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
    ),
    title: "Secure & Private",
    desc: "Your data is encrypted, and your privacy is our top priority.",
  },
];

// Budget Modes
const budgetModes = [
  {
    href: "/daily-tracker",
    title: "Daily Expense Tracker",
    icon: <Wallet className="h-10 w-10" />,
    bg: "bg-gradient-to-br from-emerald-400 to-green-600",
    color: "text-emerald-700 dark:text-emerald-300",
    desc: "Monitor your daily spending, visualize trends, and stay in control every single day.",
  },
  {
    href: "/event-budget",
    title: "Event / Travel Budget",
    icon: <Plane className="h-10 w-10" />,
    bg: "bg-gradient-to-br from-blue-400 to-indigo-600",
    color: "text-blue-700 dark:text-blue-300",
    desc: "Plan and manage budgets for trips, weddings, or events with ease and clarity.",
  },
];

// Testimonials
const testimonials = [
  {
    text: "It helped me cut down my monthly food costs by 30%!",
    author: "Anika M.",
  },
  {
    text: "I planned my entire Goa trip under budget thanks to this app.",
    author: "Rahul S.",
  },
  {
    text: "Perfect for students managing part-time income & rent.",
    author: "Arsh K.",
  },
];

const FeatureCard = ({ icon, title, desc }: Feature) => (
  <motion.article
    whileHover={{ y: -8, scale: 1.02 }}
    transition={{ duration: 0.3 }}
    className="group relative bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent dark:from-emerald-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="relative z-10">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl mb-3 font-bold tracking-tight text-gray-900 dark:text-white">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{desc}</p>
    </div>
  </motion.article>
);

const ModeCard = ({ href, icon, title, bg, color, desc }: Mode) => (
  <Link href={href} className="block group">
    <motion.div
      whileHover={{ y: -12, scale: 1.03 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 rounded-3xl shadow-xl hover:shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-300 overflow-hidden h-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-transparent dark:from-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative z-10">
        <div
          className={`${bg} w-fit mx-auto p-5 rounded-2xl mb-6 text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        <h3
          className={`text-2xl font-bold mb-4 ${color} flex items-center justify-center gap-2`}
        >
          {title}
          <ArrowRight className="h-5 w-5 transform group-hover:translate-x-2 transition-transform" />
        </h3>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          {desc}
        </p>
      </div>
    </motion.div>
  </Link>
);

const TestimonialCard = ({ text, author }: Testimonial) => (
  <motion.blockquote
    whileHover={{ scale: 1.05 }}
    transition={{ duration: 0.2 }}
    className="bg-white dark:bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all"
  >
    <Smile className="h-8 w-8 text-yellow-500 mb-4 mx-auto" />
    <p className="italic text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
      {text}
    </p>
    <footer className="font-semibold text-gray-900 dark:text-white">
      – {author}
    </footer>
  </motion.blockquote>
);

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-pink-50 to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-black text-gray-800 dark:text-gray-200 px-6 py-5 transition-colors duration-300">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.25 }}
      >
        <Header />

        {/* Hero Section */}
        <section className="text-center max-w-4xl mx-auto space-y-8 mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-4 py-2 rounded-full text-sm font-semibold"
          >
            <Sparkles className="h-4 w-4" />
            Free Forever • No Credit Card Required
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-6xl md:text-7xl font-extrabold tracking-tight leading-tight"
          >
            Manage Money Smarter with{" "}
            <span className="bg-gradient-to-r from-emerald-400 via-green-500 to-teal-500 bg-clip-text text-transparent">
              MyBudgetory
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed"
          >
            An all-in-one solution to track your everyday expenses or budget for
            special events with clarity and confidence.
          </motion.p>

          {/* Dashboard & Login Buttons only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex gap-4 justify-center flex-wrap"
          >
            <Link href="/dashboard">
              <button className="group bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center gap-3 cursor-pointer">
                <TrendingUp
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                Dashboard
              </button>
            </Link>

            <Link href="/login">
              <button className="group bg-white dark:bg-gray-800 border-2 border-emerald-500 dark:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-3 text-emerald-700 dark:text-emerald-300 cursor-pointer">
                <ShieldCheck
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                Login
              </button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <Image
              src={Piggy}
              alt="Money Management"
              className="mx-auto h-72 w-72 drop-shadow-2xl"
              priority
              quality={90}
            />
          </motion.div>
        </section>

        <SlideUp>
          {/* Why MyBudgetory */}
          <section className="mt-24 max-w-5xl mx-auto text-center">
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-300 dark:via-emerald-700 to-transparent mb-12" />
            <h2 className="text-4xl md:text-5xl mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent font-extrabold tracking-tight">
              Why Choose MyBudgetory?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Whether you&apos;re keeping track of daily coffee runs or planning
              a vacation, MyBudgetory gives you tools to stay in control.
            </p>

            {/* Get Started Free & GitHub buttons moved here */}
            <div className="flex gap-4 justify-center flex-wrap mt-8">
              <button
                onClick={() =>
                  document
                    .getElementById("bottom")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="group bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center gap-3"
              >
                <Play
                  size={20}
                  className="group-hover:scale-110 transition-transform"
                />
                Get Started Free
              </button>

              <a
                href="https://github.com/justtayyabkhxn/mybudgetory"
                target="_blank"
                rel="noopener noreferrer"
              >
                <button className="group bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-400 px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center gap-3 text-gray-900 dark:text-white">
                  <Github
                    size={20}
                    className="group-hover:scale-110 transition-transform"
                  />
                  View on GitHub
                </button>
              </a>
            </div>
          </section>
        </SlideUp>

        {/* Feature Highlights */}
        <SlideUp>
          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <FeatureCard key={i} {...feature} />
            ))}
          </section>
        </SlideUp>

        <SlideUp>
          {/* Choose Budget Mode */}
          <section className="mt-24 max-w-6xl mx-auto">
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-300 dark:via-emerald-700 to-transparent mb-12" />
            <h2 className="text-4xl md:text-5xl text-center mb-4 font-extrabold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
              Choose Your Mode
            </h2>
            <p className="text-center text-gray-600 dark:text-gray-300 mb-12 text-lg">
              Pick the perfect tool for your financial goals
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {budgetModes.map((mode, i) => (
                <ModeCard key={i} {...mode} />
              ))}
            </div>
          </section>
        </SlideUp>

        <SlideUp>
          {/* Testimonials */}
          <section className="mt-24 max-w-6xl mx-auto text-center">
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-300 dark:via-emerald-700 to-transparent mb-12" />
            <h2 className="text-4xl md:text-5xl mb-4 bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent font-extrabold tracking-tight">
              Loved by Users Like You
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-12 text-lg">
              Join thousands of happy users managing their finances smarter
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <TestimonialCard key={i} {...t} />
              ))}
            </div>
          </section>
        </SlideUp>

        <SlideUp>
          {/* CTA Footer */}
          <section className="mt-24 text-center max-w-5xl mx-auto" id="bottom">
            <div className="h-px bg-gradient-to-r from-transparent via-emerald-300 dark:via-emerald-700 to-transparent mb-12" />

            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-3xl p-12 shadow-xl border border-emerald-100 dark:border-emerald-800">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
                Start managing your money smarter — today!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
                No payment required. It&apos;s free and always will be.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/daily-tracker"
                  className="group bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2"
                >
                  Start Daily Tracking
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/event-budget"
                  className="group bg-white dark:bg-gray-800 border-2 border-emerald-500 dark:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-300"
                >
                  Plan Event Budget
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </section>
        </SlideUp>

        {/* Footer */}
        <Footer />
      </motion.div>
    </main>
  );
}