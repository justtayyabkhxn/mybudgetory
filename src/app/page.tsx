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
} from "lucide-react";
import { JSX } from "react";
import Footer from "@/components/Footer";
import SlideUp from "@/components/SlideUp";

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
    icon: <TrendingUp className="h-8 w-8 text-indigo-600 mb-3" />,
    title: "Smart Analytics",
    desc: "Track trends, analyze patterns, and get insights to improve your savings.",
  },
  {
    icon: <CalendarCheck className="h-8 w-8 text-pink-600 mb-3" />,
    title: "Goal Planning",
    desc: "Set expense limits or plan for future events with budget milestones.",
  },
  {
    icon: <ShieldCheck className="h-8 w-8 text-green-600 mb-3" />,
    title: "Secure & Private",
    desc: "Your data is encrypted, and your privacy is our top priority.",
  },
];

// Budget Modes
const budgetModes = [
  {
    href: "/daily-tracker",
    title: "Daily Expense Tracker",
    icon: <Wallet className="h-8 w-8 text-green-600 dark:text-green-400" />,
    bg: "bg-green-100 dark:bg-green-500/10",
    color: "text-green-600 dark:text-green-400",
    desc: "Monitor your daily spending, visualize trends, and stay in control every single day.",
  },
  {
    href: "/event-budget",
    title: "Event / Travel Budget",
    icon: <Plane className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
    bg: "bg-blue-100 dark:bg-blue-500/10",
    color: "text-blue-600 dark:text-blue-400",
    desc: "Plan and manage budgets for trips, weddings, or events with ease and clarity.",
  },
];

// Testimonials
const testimonials = [
  {
    text: "“It helped me cut down my monthly food costs by 30%!”",
    author: "Anika M.",
  },
  {
    text: "“I planned my entire Goa trip under budget thanks to this app.”",
    author: "Rahul S.",
  },
  {
    text: "“Perfect for students managing part-time income & rent.”",
    author: "Zoya K.",
  },
];

const FeatureCard = ({ icon, title, desc }: Feature) => (
  <article className="bg-white dark:bg-gray-900 p-5 rounded-2xl shadow hover:shadow-lg transition">
    {icon}
    <h3 className=" text-xl mb-2 text-indigo font-extrabold tracking-tight">
      {title}
    </h3>
    <p className="text-gray-600 dark:text-gray-300">{desc}</p>
  </article>
);

const ModeCard = ({ href, icon, title, bg, color, desc }: Mode) => (
  <Link
    href={href}
    className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow hover:shadow-2xl hover:scale-[1.03] transition duration-300 cursor-pointer text-center block"
  >
    <div className={`${bg} w-fit mx-auto p-4 rounded-full mb-4`}>{icon}</div>
    <h3 className={`text-xl font-bold mb-2 ${color}`}>{title}</h3>
    <p className="text-gray-600 dark:text-gray-300">{desc}</p>
  </Link>
);

const TestimonialCard = ({ text, author }: Testimonial) => (
  <blockquote className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow text-center">
    <Smile className="h-6 w-6 text-yellow-500 mb-2 mx-auto" />
    <p className="italic text-sm text-gray-600 dark:text-gray-300">{text}</p>
    <footer className="mt-2 font-bold">– {author}</footer>
  </blockquote>
);

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-pink-50 to-white dark:from-gray-900 dark:via-black dark:to-black text-gray-800 dark:text-gray-200 px-6 py-5 transition-colors duration-300">
      <Header />

      {/* Hero Section */}
      <section className="text-center max-w-3xl mx-auto space-y-6 mt-10">
        <h1 className="text-5xl font-extrabold tracking-tight leading-tight">
          Manage Money Smarter with{" "}
          <span className="text-green-300 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text">
            MyBudgetory
          </span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          An all-in-one solution to track your everyday expenses or budget for
          special events with clarity and confidence.
        </p>
        {/* Get Started Button */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={() =>
              document
                .getElementById("bottom")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="bg-white dark:bg-gray-900 px-4 py-3 rounded-xl shadow hover:shadow-lg transition text-center font-semibold text-green-700 dark:text-green-300 cursor-pointer flex items-center gap-2"
          >
            <Play size={18} />
            Get Started
          </button>

          <a
            href="https://github.com/justtayyabkhxn/mybudgetory"
            target="_blank"
            rel="noopener noreferrer"
          >
            <button className="bg-white dark:bg-green-300 px-4 py-3 rounded-xl shadow hover:shadow-lg transition text-center font-semibold text-green-700 dark:text-green-900 cursor-pointer flex items-center gap-2">
              <Github size={18} /> Read Docs
            </button>
          </a>
        </div>

        <Image
          src={Piggy}
          alt="Money Management"
          className="mx-auto h-64 w-64 drop-shadow-l"
          priority
          quality={90}
        />
      </section>
      <SlideUp>
        {/* Why MyBudgetory */}
        <section className="mt-5 max-w-4xl mx-auto text-center">
          <hr className="mb-5 text-green-300"></hr>
          <h2 className="text-3xl mb-4 text-green-300 font-extrabold tracking-tight">
            Why Choose Me?
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Whether you&apos;re keeping track of daily coffee runs or planning a
            vacation, MyBudgetory gives you tools to stay in control.
          </p>
        </section>
      </SlideUp>
      {/* Feature Highlights */}
      <SlideUp>
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 max-w-6xl mx-auto">
          {features.map((feature, i) => (
            <FeatureCard key={i} {...feature} />
          ))}
        </section>
      </SlideUp>
      <SlideUp>
        {/* Choose Budget Mode */}
        <section className="mt-16 max-w-6xl mx-auto">
          <hr className="mb-5 text-green-300"></hr>
          <h2 className="text-3xl text-center mb-8 font-extrabold tracking-tight text-green-300">
            Choose Your Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {budgetModes.map((mode, i) => (
              <ModeCard key={i} {...mode} />
            ))}
          </div>
        </section>
      </SlideUp>
      <SlideUp>
        {/* Testimonials */}
        <section className="mt-10 max-w-5xl mx-auto text-center">
          <hr className="mt-15 mb-10 text-green-300"></hr>
          <h2 className="text-3xl mb-6  text-green-300 font-extrabold tracking-tight">
            Loved by Users Like You
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>
        </section>
      </SlideUp>
      <SlideUp>
        {/* CTA Footer */}
        <section
          className="mt-10 text-center max-w-4xl mx-auto text-green-300 font-extrabold tracking-tight"
          id="bottom"
        >
          <hr className="mb-5 mt-15 text-green-300"></hr>
          <h2 className="text-2xl font-bold mb-2">
            Start managing your money smarter — today!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            No pay required. It&apos;s free and always will be.
          </p>
          <div className="flex flex-row gap-4 justify-center">
            <Link
              href="/daily-tracker"
              className="bg-white dark:bg-gray-900 px-5 py-4 rounded-xl shadow hover:shadow-lg transition text-center font-semibold text-green-700 dark:text-green-300 cursor-pointer"
            >
              Start Daily Tracking
            </Link>

            <Link href="/event-budget">
              <button className="bg-white dark:bg-green-300 px-3 py-4 rounded-xl shadow hover:shadow-lg transition text-center font-semibold text-green-700 dark:text-green-900 cursor-pointer">
                Plan Event Budget
              </button>
            </Link>
          </div>
        </section>
      </SlideUp>
      {/* Footer */}
      <Footer />
    </main>
  );
}
