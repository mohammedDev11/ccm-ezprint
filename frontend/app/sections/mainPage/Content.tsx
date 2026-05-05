"use client";

import { useEffect, useState } from "react";
import { IconArrowUp } from "@tabler/icons-react";

import ContactUs from "./sections/contact/ContactUs";
import Questions from "./sections/faq/Questions";
import Features from "./sections/features/Features";
import Footer from "./sections/footer/Footer";
import Hero from "./sections/hero/Hero";
import HowItWorks from "./sections/howItWorks/HowItWorks";
import SecurePrivate from "./sections/secure-private/SecurePrivate";

const Content = () => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 700);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="container relative">
      <Hero />
      <Features />
      <HowItWorks />
      <SecurePrivate />
      <Questions />
      <ContactUs />
      <Footer />

      <button
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className={`fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-md border border-white/10 bg-white/10 text-white shadow-lg backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/15 ${
          showScrollTop
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
      >
        <IconArrowUp size={22} />
      </button>
    </div>
  );
};

export default Content;
