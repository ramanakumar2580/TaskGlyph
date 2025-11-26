/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Check, Sparkles, Loader2, Zap, ShieldCheck } from "lucide-react";
import db from "@/lib/db/clientDb"; // ✅ IMPORT DB

// --- AUTH CHECK ---
const useAuth = () => {
  // Replace with real auth logic
  const isLoggedIn = true;
  const userEmail = "ramana@example.com";
  return { isLoggedIn, userEmail };
};

export default function PricingSection() {
  const [currency, setCurrency] = useState<"USD" | "INR">("INR");
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const router = useRouter();
  const { isLoggedIn, userEmail } = useAuth();

  const pricingTiers = [
    {
      name: "Free",
      id: "free",
      prices: { USD: 0, INR: 0 },
      frequency: "/ forever",
      description: "Essential tools for casual users.",
      features: ["Works Offline", "21 Tasks Limit", "1 Device Sync"],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Basic",
      id: "basic",
      prices: { USD: 5, INR: 199 },
      frequency: "/ mo",
      description: "Step up your organization game.",
      features: ["Unlimited Tasks", "Personal Diary", "2 Devices Sync"],
      cta: "Start Basic",
      popular: false,
    },
    {
      name: "Pro",
      id: "pro",
      prices: { USD: 12, INR: 499 },
      frequency: "/ mo",
      description: "Unlock AI power & full potential.",
      features: [
        "Everything in Basic",
        "AI Weekly Insights",
        "5 Devices Sync",
        "Priority Support",
      ],
      cta: "Go Pro",
      popular: true, // Highlights this card
    },
    {
      name: "Ultra",
      id: "ultra",
      prices: { USD: 25, INR: 999 },
      frequency: "/ mo",
      description: "For teams & power obsessives.",
      features: [
        "Everything in Pro",
        "Unlimited Devices",
        "Collaboration Tools",
        "24/7 Dedicated Support",
      ],
      cta: "Get Ultra",
      popular: false,
    },
  ];

  const handlePlanClick = async (tier: any) => {
    // 1. Login Check
    if (!isLoggedIn) {
      router.push("/auth/signup");
      return;
    }

    // 2. Free Plan
    if (tier.name === "Free") {
      router.push("/app/dashboard");
      return;
    }

    // 3. Payment Flow
    setLoadingTier(tier.name);
    try {
      const amount = currency === "INR" ? tier.prices.INR : tier.prices.USD;

      // A. Create Order
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: amount }),
      });
      const order = await res.json();

      if (!order.id) throw new Error("Order creation failed");

      // B. Razorpay Options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "TaskGlyph",
        description: `Upgrade to ${tier.name}`,
        order_id: order.id,
        // C. Handler
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                plan_name: tier.name,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // ✅ 4. UPDATE USER SETTINGS IN DEXIE DB
              await db.userSettings.put({
                id: "me",
                tier: tier.name, // "Basic" | "Pro" | "Ultra"
                email: userEmail,
              });

              alert(`Welcome to TaskGlyph ${tier.name}! 🚀`);
              window.location.href = "/app/dashboard";
            } else {
              alert("Verification Failed");
              setLoadingTier(null);
            }
          } catch (err) {
            console.error(err);
            alert("Payment success but update failed.");
            setLoadingTier(null);
          }
        },
        prefill: { email: userEmail },
        theme: { color: tier.popular ? "#6366f1" : "#0f172a" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
      rzp.on("payment.failed", () => {
        alert("Payment Failed");
        setLoadingTier(null);
      });
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
      setLoadingTier(null);
    }
  };

  return (
    <section className="relative w-full min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center py-20 px-4 overflow-hidden">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />

      {/* --- Ambient Background Effects --- */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-200/40 via-purple-100/20 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-100/30 blur-[100px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold uppercase tracking-widest"
          >
            <Zap size={12} fill="currentColor" /> Simple Pricing
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight"
          >
            Invest in your <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              productivity engine.
            </span>
          </motion.h2>

          {/* Currency Toggle */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center p-1.5 bg-white rounded-full border border-slate-200 shadow-sm mt-6 relative"
          >
            <motion.div
              layout
              className={`absolute top-1.5 bottom-1.5 w-[50%] bg-slate-900 rounded-full shadow-md z-0 transition-all duration-300 ${
                currency === "USD" ? "left-[50%]" : "left-1.5"
              }`}
            />
            <button
              onClick={() => setCurrency("INR")}
              className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-bold transition-colors duration-300 ${
                currency === "INR"
                  ? "text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              INR (₹)
            </button>
            <button
              onClick={() => setCurrency("USD")}
              className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-bold transition-colors duration-300 ${
                currency === "USD"
                  ? "text-white"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              USD ($)
            </button>
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
          {pricingTiers.map((tier, index) => {
            const isPro = tier.popular;

            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative flex flex-col p-6 rounded-[2rem] transition-all duration-300 group
                  ${
                    isPro
                      ? "bg-slate-900 text-white shadow-2xl shadow-indigo-500/20 scale-105 z-10 ring-1 ring-white/10"
                      : "bg-white text-slate-800 border border-slate-100 shadow-xl shadow-slate-200/50 hover:-translate-y-2 hover:shadow-2xl"
                  }
                `}
              >
                {/* Popular Badge */}
                {isPro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1">
                      <Sparkles size={12} fill="currentColor" /> Most Popular
                    </div>
                  </div>
                )}

                {/* Card Header */}
                <div className="mb-6">
                  <h3
                    className={`text-lg font-bold ${
                      isPro ? "text-indigo-300" : "text-indigo-600"
                    }`}
                  >
                    {tier.name}
                  </h3>
                  <p
                    className={`text-sm mt-1 leading-relaxed ${
                      isPro ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {tier.description}
                  </p>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-black tracking-tighter">
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={currency}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                      >
                        {currency === "INR" ? "₹" : "$"}
                        {currency === "INR" ? tier.prices.INR : tier.prices.USD}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                  <span
                    className={`text-sm font-medium ${
                      isPro ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    {tier.frequency}
                  </span>
                </div>

                {/* Features List */}
                <div className="flex-grow space-y-4 mb-8">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 p-0.5 rounded-full ${
                          isPro ? "bg-indigo-500/20" : "bg-indigo-50"
                        }`}
                      >
                        <Check
                          size={14}
                          className={
                            isPro ? "text-indigo-400" : "text-indigo-600"
                          }
                          strokeWidth={3}
                        />
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          isPro ? "text-slate-300" : "text-slate-600"
                        }`}
                      >
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => handlePlanClick(tier)}
                  disabled={!!loadingTier}
                  className={`w-full py-4 rounded-2xl text-sm font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-2
                    ${
                      isPro
                        ? "bg-white text-slate-900 hover:bg-indigo-50 hover:shadow-lg hover:scale-[1.02]"
                        : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-lg hover:scale-[1.02]"
                    }
                    ${!!loadingTier && "opacity-50 cursor-not-allowed"}
                  `}
                >
                  {loadingTier === tier.name ? (
                    <Loader2 className="animate-spin w-4 h-4" />
                  ) : (
                    tier.cta
                  )}
                </button>

                {/* Security Note */}
                <div className="mt-4 flex items-center justify-center gap-1.5 opacity-60">
                  <ShieldCheck
                    size={12}
                    className={isPro ? "text-slate-500" : "text-slate-400"}
                  />
                  <span
                    className={`text-[10px] ${
                      isPro ? "text-slate-500" : "text-slate-400"
                    }`}
                  >
                    Secure Payment
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer Note */}
        <p className="text-center text-slate-400 text-sm mt-16">
          Prices are adjusted for Purchasing Power Parity (PPP). Cancel anytime.
        </p>
      </div>
    </section>
  );
}
