"use client";

import React from "react";
import clsx from "clsx";
import { motion } from "motion/react";
import Image, { StaticImageData } from "next/image";

export type ConversationMessage = {
  id: string;
  sender: "user" | "admin";
  text: string;
};

type ConversationThreadProps = {
  messages: ConversationMessage[];
  animated?: boolean;
  className?: string;
  adminIcon: string | StaticImageData;
  adminName?: string;
  userLabel?: string;
};

const bubbleVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: index * 0.18,
      duration: 0.45,
    },
  }),
};

const Avatar = ({
  sender,
  adminIcon,
  userLabel = "S",
}: {
  sender: "user" | "admin";
  adminIcon: string | StaticImageData;
  userLabel?: string;
}) => {
  if (sender === "admin") {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 shadow-surface ring-1 ring-[var(--border)]">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500">
          <Image
            src={adminIcon}
            alt="Admin avatar"
            width={18}
            height={18}
            className="h-[18px] w-[18px] object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--surface-2)] text-sm font-semibold text-[var(--title)] shadow-surface ring-1 ring-[var(--border)]">
      {userLabel}
    </div>
  );
};

const MessageBubble = ({
  message,
  index,
  animated,
  adminIcon,
  userLabel,
}: {
  message: ConversationMessage;
  index: number;
  animated: boolean;
  adminIcon: string | StaticImageData;
  userLabel?: string;
}) => {
  const isAdmin = message.sender === "admin";
  const Wrapper = animated ? motion.div : "div";

  return (
    <Wrapper
      custom={index}
      variants={animated ? bubbleVariants : undefined}
      initial={animated ? "hidden" : undefined}
      whileInView={animated ? "visible" : undefined}
      viewport={animated ? { once: true, amount: 0.35 } : undefined}
      className={clsx(
        "flex w-full items-end gap-3",
        isAdmin ? "justify-end" : "justify-start"
      )}
    >
      {!isAdmin && (
        <Avatar sender="user" adminIcon={adminIcon} userLabel={userLabel} />
      )}

      <div
        className={clsx(
          "max-w-[78%] rounded-[22px] px-4 py-3 sm:px-5 sm:py-4 shadow-surface",
          isAdmin
            ? "rounded-br-md bg-brand-500 text-white"
            : "rounded-bl-md border border-[var(--border)] bg-[var(--surface)] text-[var(--title)]"
        )}
      >
        <p className="text-sm leading-6 sm:text-base">{message.text}</p>
      </div>

      {isAdmin && <Avatar sender="admin" adminIcon={adminIcon} />}
    </Wrapper>
  );
};

const ConversationThread = ({
  messages,
  animated = true,
  className,
  adminIcon,
  userLabel = "S",
}: ConversationThreadProps) => {
  const Container = animated ? motion.div : "div";

  return (
    <Container
      className={clsx(" rounded-md p-4 sm:p-5", className)}
      initial={animated ? { opacity: 0, y: 20 } : undefined}
      whileInView={animated ? { opacity: 1, y: 0 } : undefined}
      viewport={animated ? { once: true, amount: 0.2 } : undefined}
      transition={animated ? { duration: 0.45 } : undefined}
    >
      <div className="space-y-4 sm:space-y-5">
        {messages.map((message, index) => (
          <MessageBubble
            key={message.id}
            message={message}
            index={index}
            animated={animated}
            adminIcon={adminIcon}
            userLabel={userLabel}
          />
        ))}
      </div>
    </Container>
  );
};

export default ConversationThread;
