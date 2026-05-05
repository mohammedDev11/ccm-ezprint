"use client";

import React from "react";
import {
  IconClock,
  IconHeadset,
  IconMail,
  IconMessage,
  IconMessages,
  IconShieldCheck,
  IconUser,
} from "@tabler/icons-react";
import FloatingInput from "@/components/ui/input/FloatingInput";
import Button from "@/components/ui/button/Button";
import SectionHeader from "../../components/SectionHeader";

const ContactUs = () => {
  return (
    <section id="contact" className="section">
      <div className="container">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* left form */}
          <div className="order-2 lg:order-1">
            <div className="max-w-xl space-y-8">
              <SectionHeader
                title="Contact EzPrint"
                description="Reach out for support, questions, or assistance with your printing experience."
              />

              <form className="space-y-5">
                <FloatingInput
                  id="fullName"
                  name="fullName"
                  type="text"
                  label="Full Name"
                  icon={<IconUser size={18} />}
                />

                <FloatingInput
                  id="email"
                  name="email"
                  type="email"
                  label="Email Address"
                  icon={<IconMail size={18} />}
                />

                <div
                  className="relative w-full min-w-0 rounded-md border transition-all duration-200 focus-within:ring-2 focus-within:ring-brand-500/20"
                  style={{
                    background: "var(--surface)",
                    borderColor: "var(--border)",
                  }}
                >
                  <span
                    className="absolute top-5 left-4 z-10"
                    style={{ color: "var(--muted)" }}
                  >
                    <IconMessage size={18} />
                  </span>

                  <textarea
                    id="message"
                    name="message"
                    placeholder=" "
                    rows={6}
                    className="peer w-full resize-none rounded-md bg-transparent pt-6 pb-3 pr-4 pl-12 text-sm outline-none"
                    style={{ color: "var(--foreground)" }}
                  />

                  <label
                    htmlFor="message"
                    className="pointer-events-none absolute left-11 top-6 z-[1] px-1 text-sm transition-all duration-200 ease-out peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-xs"
                    style={{
                      color: "var(--muted)",
                      background: "var(--surface)",
                    }}
                  >
                    Message
                  </label>
                </div>

                <div className="pt-2">
                  <Button type="submit" size="md">
                    Send Message
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* right support panel */}
          <div className="order-1 lg:order-2">
            <div className="relative mx-auto w-full max-w-[520px]">
              <div
                className="relative overflow-hidden rounded-[2rem] border p-6 shadow-surface-lg sm:p-7"
                style={{
                  borderColor: "var(--border)",
                  background:
                    "linear-gradient(155deg, color-mix(in srgb, var(--surface) 92%, transparent), color-mix(in srgb, var(--surface-2) 96%, transparent))",
                }}
                aria-label="EzPrint contact support preview"
              >
                <div
                  className="absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl"
                  style={{ background: "rgba(var(--brand-rgb), 0.18)" }}
                />
                <div
                  className="absolute -bottom-12 left-8 h-36 w-36 rounded-full blur-3xl"
                  style={{ background: "rgba(var(--brand-rgb), 0.1)" }}
                />

                <div className="relative z-10 space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                        Support channels
                      </p>
                      <h3 className="mt-2 text-2xl font-semibold text-[var(--title)]">
                        We are here to help
                      </h3>
                    </div>
                    <span
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-brand"
                      style={{
                        background:
                          "linear-gradient(135deg, var(--color-brand-400), var(--color-brand-600))",
                      }}
                    >
                      <IconHeadset size={28} stroke={1.8} />
                    </span>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {[
                      {
                        icon: IconMessages,
                        title: "Message support",
                        text: "Questions, account help, and print guidance.",
                      },
                      {
                        icon: IconClock,
                        title: "Fast follow-up",
                        text: "We route urgent printing issues quickly.",
                      },
                      {
                        icon: IconShieldCheck,
                        title: "Private by design",
                        text: "Never include sensitive document contents.",
                      },
                      {
                        icon: IconMail,
                        title: "Email ready",
                        text: "Use your campus email for faster context.",
                      },
                    ].map((item) => {
                      const Icon = item.icon;

                      return (
                        <div
                          key={item.title}
                          className="rounded-2xl border p-4"
                          style={{
                            borderColor: "var(--border)",
                            background: "var(--surface)",
                          }}
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--color-brand-500)_12%,var(--surface-2))] text-[var(--color-brand-500)]">
                            <Icon size={20} stroke={1.8} />
                          </span>
                          <p className="mt-3 text-sm font-semibold text-[var(--title)]">
                            {item.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-[var(--paragraph)]">
                            {item.text}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor:
                        "color-mix(in srgb, var(--color-brand-500) 26%, var(--border))",
                      background:
                        "color-mix(in srgb, var(--color-brand-500) 9%, var(--surface))",
                    }}
                  >
                    <p className="text-sm font-semibold text-[var(--title)]">
                      Tip before sending
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[var(--paragraph)]">
                      Include the printer location, queue name, and release code status when reporting a printing issue.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;
