"use client";

import React, { useState } from "react";
import Button from "@/components/ui/button/Button";
import FloatingInput from "@/components/ui/input/FloatingInput";

const AskQuestion = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    question: "",
  });

  const handleChange =
    (field: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Question submitted:", form);
  };

  const handleClear = () => {
    setForm({
      name: "",
      email: "",
      subject: "",
      question: "",
    });
  };

  return (
    <section className="w-full px-6 py-4">
      <div className="mb-5">
        <p className="paragraph max-w-2xl">
          Send us your question and we’ll get back to you as soon as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FloatingInput
          id="ask-name"
          type="text"
          name="name"
          label="Your Name"
          value={form.name}
          onChange={handleChange("name")}
          autoComplete="name"
        />

        <FloatingInput
          id="ask-email"
          type="email"
          name="email"
          label="Email Address"
          value={form.email}
          onChange={handleChange("email")}
          autoComplete="email"
        />

        <FloatingInput
          id="ask-subject"
          type="text"
          name="subject"
          label="Subject"
          value={form.subject}
          onChange={handleChange("subject")}
        />

        <div
          className="rounded-2xl border px-4 py-4 transition focus-within:ring-2 focus-within:ring-brand-500/20"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
          }}
        >
          <label
            htmlFor="ask-question"
            className="mb-2 block text-sm font-medium"
            style={{ color: "var(--title)" }}
          >
            Your Question
          </label>

          <textarea
            id="ask-question"
            name="question"
            rows={5}
            value={form.question}
            onChange={handleChange("question")}
            placeholder="Write your question here..."
            className="w-full resize-none bg-transparent text-sm outline-none"
            style={{
              color: "var(--foreground)",
            }}
          />
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-3">
          <Button type="submit" variant="primary">
            Send Question
          </Button>

          <Button type="button" variant="secondary" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </form>
    </section>
  );
};

export default AskQuestion;
