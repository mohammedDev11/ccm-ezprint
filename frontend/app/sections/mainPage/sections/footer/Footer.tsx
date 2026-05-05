"use client";

import React from "react";
import Link from "next/link";
import {
  FaLinkedinIn,
  FaInstagram,
  FaFacebookF,
  FaYoutube,
} from "react-icons/fa";
import { BsTwitterX } from "react-icons/bs";
import { BrandMark } from "@/components/shared/page/Logo";

const Footer = () => {
  const brand = {
    name: "EzPrint",
    tagline: "KFUPM Printing Management System",
    description:
      "EzPrint provides a secure and streamlined printing experience for KFUPM students, faculty, and staff. Upload documents, release print jobs safely, and manage your printing workflow with clarity and control.",
  };

  const socialLinks = [
    {
      id: 1,
      label: "LinkedIn",
      href: "https://www.linkedin.com/school/kfupm/",
      icon: FaLinkedinIn,
      color: "#0A66C2",
    },
    {
      id: 2,
      label: "Instagram",
      href: "https://www.instagram.com/kfupm/",
      icon: FaInstagram,
      color: "#E1306C",
    },
    {
      id: 3,
      label: "X",
      href: "https://x.com/KFUPM",
      icon: BsTwitterX,
      color: "#111111",
    },
    {
      id: 4,
      label: "Facebook",
      href: "https://www.facebook.com/KFUPM/",
      icon: FaFacebookF,
      color: "#1877F2",
    },
    {
      id: 5,
      label: "YouTube",
      href: "https://www.youtube.com/channel/UCZTsFCBq4ZgU3lJJQJL5fgw",
      icon: FaYoutube,
      color: "#FF0000",
    },
  ];

  const sections = [
    {
      title: "Quick Links",
      links: [
        { label: "Features", href: "#features" },
        { label: "How It Works", href: "#how-it-works" },
        { label: "Secure & Private", href: "#secure-private" },
        { label: "FAQ", href: "#faq" },
      ],
    },
    {
      title: "System Access",
      links: [
        { label: "Student Login", href: "#" },
        { label: "Admin Portal", href: "#" },
        { label: "Print History", href: "#" },
        { label: "Balance & Transactions", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "User Guide", href: "#" },
        { label: "Printing Policies", href: "#" },
        { label: "Privacy Notice", href: "#" },
        { label: "Help Center", href: "#" },
      ],
    },
    {
      title: "Contact",
      links: [
        { label: "KFUPM IT Support", href: "#" },
        { label: "Email Support", href: "mailto:support@kfupm.edu.sa" },
        { label: "Report an Issue", href: "#" },
        { label: "Campus Services", href: "#" },
      ],
    },
  ];

  return (
    <footer className="relative mt-32 px-2 pb-6 text-[var(--foreground)]">
      <div className="container">
        <div className="flex flex-col gap-10">
          {/* top */}
          <div>
            <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-brand-500 to-transparent" />

            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 flex items-center gap-4">
                  <BrandMark className="h-12 w-12" />

                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-[var(--title)] sm:text-4xl">
                      {brand.name}
                    </h2>
                    <p className="mt-1 text-sm text-[var(--muted)] sm:text-base">
                      {brand.tagline}
                    </p>
                  </div>
                </div>

                <p className="max-w-2xl text-sm leading-7 text-[var(--paragraph)] sm:text-base">
                  {brand.description}
                </p>
              </div>

              {/* social links */}
              <div className="flex flex-wrap items-center gap-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;

                  return (
                    <a
                      key={social.id}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex h-11 items-center overflow-hidden rounded-md px-0 shadow-surface transition-all duration-300"
                      style={{
                        background: "var(--surface)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = social.color;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--surface)";
                      }}
                    >
                      {/* icon */}
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center text-[var(--title)] transition-colors duration-300 group-hover:text-white">
                        <Icon size={18} />
                      </div>

                      {/* label */}
                      <span className="max-w-0 overflow-hidden whitespace-nowrap pr-0 text-sm font-medium text-white transition-all duration-700 group-hover:max-w-[140px] group-hover:pr-4">
                        {social.label}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* middle */}
          <div>
            <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-brand-500 to-transparent" />

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {sections.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-4 text-lg font-semibold text-[var(--title)] sm:text-xl">
                    {section.title}
                  </h3>

                  <div className="flex flex-col gap-3 text-sm text-[var(--paragraph)]">
                    {section.links.map((link) =>
                      link.href.startsWith("#") ||
                      link.href.startsWith("mailto:") ? (
                        <a
                          key={link.label}
                          href={link.href}
                          className="transition-all duration-300 hover:translate-x-1 hover:text-brand-600"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          key={link.label}
                          href={link.href}
                          className="transition-all duration-300 hover:translate-x-1 hover:text-brand-600"
                        >
                          {link.label}
                        </Link>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* bottom */}
          <div className="border-t border-[var(--border)] pt-6">
            <div className="flex flex-col items-center justify-between gap-3 text-center text-xs text-[var(--muted)] sm:text-sm md:flex-row md:text-left">
              <span>© 2026 EzPrint. All rights reserved.</span>

              <span>
                Developed for{" "}
                <span className="font-medium text-[var(--title)]">KFUPM</span>{" "}
                printing services.
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
