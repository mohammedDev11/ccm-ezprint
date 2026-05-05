"use client";

import React, { useState } from "react";
import {
  IconHelpCircle,
  IconMessageCircle,
  IconPrinter,
  IconShieldCheck,
} from "@tabler/icons-react";
import SectionHeader from "../../components/SectionHeader";
import { Faq } from "./Faq";
import Button from "@/components/ui/button/Button";
import Modal from "@/components/ui/modal/Modal";
import AskQuestion from "./AskQuestion";

const Questions = () => {
  const [open, setOpen] = useState(false);

  const faqItems = [
    {
      id: "q1",
      title: "How do I print a file using EzPrint?",
      content:
        "Sign in to your account, upload your document, and send it to a printer queue. Your job will remain securely stored until you authenticate at the printer and release it.",
    },
    {
      id: "q2",
      title: "Is my document private and secure?",
      content:
        "Yes. Your file is stored in a secure queue and can only be accessed by you. It is automatically deleted after printing or when the retention period expires.",
    },
    {
      id: "q3",
      title: "What happens if my balance is insufficient?",
      content:
        "The system verifies your balance before printing. If your balance or quota is not enough, the job will not be released until you add sufficient credit.",
    },
    {
      id: "q4",
      title: "Can I track my print activity?",
      content:
        "Yes. You can view your recent print jobs, transaction history, and usage details directly from your dashboard.",
    },
    {
      id: "q5",
      title: "What happens after my file is printed?",
      content:
        "Once printing is completed, the job is removed from the queue and the file is automatically deleted to ensure your privacy.",
    },
  ];

  return (
    <>
      <section id="faq" className="section">
        <div className="container">
          <div className="space-y-10">
            {/* top row */}
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeader
                title="Frequently Asked Questions"
                description="Everything you need to know about uploading, securing, and releasing your print jobs with EzPrint."
              />

              <div className="shrink-0">
                <Button onClick={() => setOpen(true)}>Need More Help?</Button>
              </div>
            </div>

            {/* bottom row */}
            <div className="grid items-center gap-10 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-14">
              {/* left help panel */}
              <div className="relative mx-auto w-full max-w-[320px] lg:mx-0">
                <div
                  className="relative overflow-hidden rounded-[2rem] border p-5 shadow-surface-lg"
                  style={{
                    borderColor: "var(--border)",
                    background:
                      "linear-gradient(155deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
                  }}
                  aria-label="EzPrint help center preview"
                >
                  <div
                    className="absolute right-5 top-5 h-20 w-20 rounded-full blur-2xl"
                    style={{ background: "rgba(var(--brand-rgb), 0.18)" }}
                  />

                  <div className="relative z-10 space-y-5">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-brand"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--color-brand-400), var(--color-brand-600))",
                        }}
                      >
                        <IconHelpCircle size={25} stroke={1.8} />
                      </span>
                      <span className="rounded-full border px-3 py-1 text-xs font-semibold text-[var(--muted)]" style={{ borderColor: "var(--border)" }}>
                        Help center
                      </span>
                    </div>

                    <div>
                      <p className="text-xl font-semibold text-[var(--title)]">
                        Need a quick answer?
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[var(--paragraph)]">
                        Common print, release, privacy, and quota questions are grouped for fast scanning.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {[
                        {
                          icon: IconPrinter,
                          label: "Print release",
                          text: "Upload, queue, authenticate",
                        },
                        {
                          icon: IconShieldCheck,
                          label: "Privacy",
                          text: "Secure files and auto cleanup",
                        },
                        {
                          icon: IconMessageCircle,
                          label: "Support",
                          text: "Ask for help anytime",
                        },
                      ].map((item) => {
                        const Icon = item.icon;

                        return (
                          <div
                            key={item.label}
                            className="flex items-center gap-3 rounded-2xl border p-3"
                            style={{
                              borderColor: "var(--border)",
                              background: "var(--surface)",
                            }}
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-brand-500)_12%,var(--surface-2))] text-[var(--color-brand-500)]">
                              <Icon size={20} stroke={1.8} />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-sm font-semibold text-[var(--title)]">
                                {item.label}
                              </span>
                              <span className="block truncate text-xs text-[var(--muted)]">
                                {item.text}
                              </span>
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* right faq */}
              <div className="w-full">
                <Faq allowMultiple={false}>
                  {faqItems.map((item) => (
                    <Faq.Item key={item.id} id={item.id} title={item.title}>
                      {item.content}
                    </Faq.Item>
                  ))}
                </Faq>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal open={open} onClose={() => setOpen(false)}>
        <AskQuestion />
      </Modal>
    </>
  );
};

export default Questions;
