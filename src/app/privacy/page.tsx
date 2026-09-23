"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Lock, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Public page — deliberately no useAuthGuard, so it can be read before signing
// up and linked from the app stores.

const EFFECTIVE_DATE = "23 September 2026";
const CONTACT_EMAIL = "tayyabkhangk4734@gmail.com";

function Block({
  id,
  title,
  children,
  delay = 0,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="scroll-mt-24"
    >
      <h3 className="text-lg font-extrabold tracking-tight text-ink mb-2">{title}</h3>
      <div className="space-y-3 text-[15px] leading-relaxed text-body">{children}</div>
    </motion.section>
  );
}

function Bullets({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="space-y-1.5 pl-1">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2.5">
          <span className="mt-[0.6em] h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen text-ink">
      <div className="max-w-3xl mx-auto px-4 sm:px-8 py-6 pb-16">
        <Header />

        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-xs font-semibold text-mute hover:text-ink transition-colors"
        >
          <ArrowLeft size={13} /> Back
        </Link>

        {/* ── Title ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mt-4 mb-10"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <ShieldCheck size={16} className="text-ink-deep" />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-mute">Legal</p>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Privacy Policy</h1>
          <p className="text-sm text-mute mt-2">Effective {EFFECTIVE_DATE}</p>
          <p className="text-[15px] leading-relaxed text-body mt-4">
            MyBudgetory is a personal budgeting app. This policy explains what information we
            collect, how we use it, and the choices you have. The short version: your data is
            used only to run the app for you, and we never sell it or use it for advertising.
          </p>
          <p className="text-sm mt-3">
            <a href="#data-privacy" className="font-semibold text-ink-deep underline underline-offset-2">
              Jump to Data Privacy →
            </a>
          </p>
        </motion.div>

        <div className="space-y-9 bg-canvas/80 rounded-2xl p-6 sm:p-8">
          <Block title="1. Information we collect" delay={0.04}>
            <p>When you create an account and use MyBudgetory we store:</p>
            <Bullets
              items={[
                <><strong className="text-ink">Account details</strong> — your name and email address.</>,
                <><strong className="text-ink">Your password</strong> — stored only as a bcrypt hash; we never store or see the plain password.</>,
                <>
                  <strong className="text-ink">Financial entries you add</strong> — transactions, bank balance and
                  its history, investment assets and their valuations, budget goals, debts and loans, recurring
                  payments, and split-bill events with their participants.
                </>,
              ]}
            />
            <p>
              We do not collect your bank credentials, card numbers, location, contacts, or any data
              from other apps. Everything financial in MyBudgetory is something you typed in yourself.
            </p>
          </Block>

          <Block title="2. How we use it" delay={0.08}>
            <p>
              Your information is used only to provide the app to you: to sign you in, to store and
              display your entries, and to calculate your charts, statistics, balances and net worth.
            </p>
          </Block>

          <Block title="3. What we don't do" delay={0.12}>
            <Bullets
              items={[
                "We do not sell your data.",
                "We do not share your data with advertisers or data brokers.",
                "We do not show ads or use your data to profile you.",
              ]}
            />
          </Block>

          <Block title="4. Third parties" delay={0.16}>
            <p>A small number of service providers help us run the app:</p>
            <Bullets
              items={[
                <><strong className="text-ink">Hosting</strong> — the web app and its API run on a cloud hosting provider.</>,
                <><strong className="text-ink">Database</strong> — your account and entries are stored in a MongoDB database.</>,
                <>
                  <strong className="text-ink">AI advice</strong> — only to produce the AI advice features
                  (the weekly/monthly advice cards and the Net Worth &ldquo;Generate AI Insights&rdquo; button),
                  aggregated figures such as totals, monthly balances and per-category sums are sent to an AI
                  provider. Your name, email and individual transaction descriptions are not part of that
                  request, and advice is cached so it is requested at most once per period.
                </>,
              ]}
            />
          </Block>

          <Block title="5. Retention" delay={0.2}>
            <p>
              We keep your data for as long as your account exists. When you delete your account,
              your data is removed from our database straight away (see below).
            </p>
          </Block>

          <Block title="6. Contact" delay={0.24}>
            <p>
              Questions about this policy or your data? Email{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="font-semibold text-ink-deep underline underline-offset-2"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
            <p>
              If we change this policy we will update the effective date above; material changes
              will be announced in the app.
            </p>
          </Block>
        </div>

        {/* ── Data Privacy ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mt-14 mb-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Lock size={16} className="text-ink-deep" />
            </div>
          </div>
          <h2 id="data-privacy" className="text-3xl font-extrabold tracking-tight scroll-mt-24">
            Data Privacy
          </h2>
          <p className="text-[15px] leading-relaxed text-body mt-2">
            How your data is protected, and how to remove it.
          </p>
        </motion.div>

        <div className="space-y-9 bg-canvas/80 rounded-2xl p-6 sm:p-8">
          <Block title="Encryption at rest" delay={0.14}>
            <p>
              Transaction amounts are encrypted before they are written to the database, so they
              are not readable as plain numbers in the stored records.
            </p>
          </Block>

          <Block title="Passwords" delay={0.18}>
            <p>
              Passwords are hashed with bcrypt. We cannot see your password, and it cannot be
              recovered from what we store — only checked against.
            </p>
          </Block>

          <Block title="Sessions" delay={0.22}>
            <p>
              Signing in issues a signed JSON Web Token (JWT). Your device sends it with each
              request so the server knows which account the data belongs to; every request is
              scoped to your account only. Signing out removes the token from the device.
            </p>
          </Block>

          <Block title="Data on your device" delay={0.26}>
            <p>
              To stay fast and work offline, the app keeps some data locally on your device: cached
              screens and AI advice, your theme and privacy-mode preferences, and a queue of
              transactions added while offline (sent to the server once you are back online). This
              local data stays on your device; deleting your account clears it from the device you
              delete from, and you can also clear it any time through your browser&apos;s site data settings.
            </p>
          </Block>

          <Block id="delete-account" title="Deleting your account" delay={0.3}>
            <p>
              You can delete your account at any time from{" "}
              <Link href="/profile" className="font-semibold text-ink-deep underline underline-offset-2">
                Profile
              </Link>{" "}
              → <strong className="text-ink">Danger zone</strong> →{" "}
              <strong className="text-ink">Delete account</strong>. You will be asked to confirm with
              your password. Deletion is immediate and permanent, and removes:
            </p>
            <Bullets
              items={[
                "your account (name, email and password hash)",
                "all your transactions",
                "your bank balance and its history",
                "your assets and all their valuations",
                "your budget goals",
                "your debts and loans",
                "your recurring payments",
                "your expenses",
                "split-bill events you created, with their participants and entries",
              ]}
            />
            <p>
              The session and local data on the device you delete from are cleared as well. Deleted
              data cannot be restored.
            </p>
          </Block>
        </div>
      </div>

      <Footer />
    </div>
  );
}
