import React from "react";

type GlassCardProps = {
  children: React.ReactNode;
  className?: string;
};

const GlassCard = ({ children, className = "" }: GlassCardProps) => {
  return (
    <div
      className={`relative bg-brand-900 overflow-hidden rounded-2xl p-6 text-white ${className}`}
    >
      {/* background blob shapes */}
      <div className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full bg-white/20 blur-3xl"></div>

      <div className="pointer-events-none absolute bottom-0 left-0 h-52 w-52 rounded-full bg-white/10 blur-2xl"></div>

      {/* content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

export default GlassCard;
