"use client";

import Button from "@/components/ui/button/Button";
import { apiGet, apiPost } from "@/services/api";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Delete,
  Fingerprint,
  Loader2,
  TicketCheck,
  WalletCards,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

type RedeemCardBoxProps = {
  currentBalance?: number;
  onRedeem?: (code: string) => void;
};

type KeypadButtonProps = {
  children: ReactNode;
  onClick: () => void;
  accent?: boolean;
  disabled?: boolean;
  ariaLabel?: string;
};

const CODE_MAX_LENGTH = 16;
const formatQuota = (value: number) => value.toFixed(2);
const normalizeCode = (value: string) =>
  value.replace(/\D/g, "").slice(0, CODE_MAX_LENGTH);

function KeypadButton({
  children,
  onClick,
  accent = false,
  disabled = false,
  ariaLabel,
}: KeypadButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={onClick}
      className="flex h-14 items-center justify-center rounded-2xl border text-base font-semibold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 sm:h-16 sm:text-lg"
      style={{
        borderColor: accent
          ? "color-mix(in srgb, var(--color-brand-500) 36%, var(--border))"
          : "var(--border)",
        background: accent
          ? "rgba(var(--brand-rgb), 0.12)"
          : "color-mix(in srgb, var(--surface) 78%, transparent)",
        color: accent ? "var(--color-brand-600)" : "var(--title)",
        boxShadow:
          "inset 0 1px 0 rgba(255,255,255,0.06), 0 10px 22px rgba(var(--shadow-color), 0.08)",
      }}
    >
      {children}
    </button>
  );
}

const RedeemCardBox = ({
  currentBalance = 0,
  onRedeem,
}: RedeemCardBoxProps) => {
  const [code, setCode] = useState("");
  const [balance, setBalance] = useState(currentBalance);
  const [loadingBalance, setLoadingBalance] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"success" | "error">("success");

  const normalizedCode = useMemo(() => normalizeCode(code), [code]);
  const isDisabled = normalizedCode.length === 0 || submitting;

  useEffect(() => {
    let mounted = true;

    apiGet<{ quota: number }>("/user/quota/overview", "user")
      .then((data) => {
        if (!mounted || typeof data?.quota !== "number") {
          return;
        }

        setBalance(data.quota);
      })
      .catch(() => {
        // Keep the local fallback visible if quota overview cannot be loaded.
      })
      .finally(() => {
        if (mounted) {
          setLoadingBalance(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const updateCode = (value: string) => {
    setCode(normalizeCode(value));
    if (message) {
      setMessage("");
    }
  };

  const appendDigit = (digit: string) => {
    updateCode(`${normalizedCode}${digit}`);
  };

  const clearCode = () => {
    updateCode("");
  };

  const removeLastDigit = () => {
    updateCode(normalizedCode.slice(0, -1));
  };

  const handleRedeem = async () => {
    if (!normalizedCode) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    try {
      const response = await apiPost<{
        quota?: number;
        balance?: number;
        message?: string;
      }>("/user/redeem", { code: normalizedCode }, "user");

      if (typeof response?.quota === "number") {
        setBalance(response.quota);
      } else if (typeof response?.balance === "number") {
        setBalance(response.balance);
      }

      setMessage(response?.message || "Voucher redeemed. Your quota was updated.");
      setMessageTone("success");
      setCode("");
      onRedeem?.(normalizedCode);
    } catch (requestError) {
      setMessage(
        requestError instanceof Error
          ? requestError.message
          : "Unable to redeem the code.",
      );
      setMessageTone("error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void handleRedeem();
  };

  const keypadRows = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
  ];

  return (
    <section className="mx-auto w-full max-w-6xl">
      <form
        onSubmit={handleSubmit}
        className="relative overflow-hidden rounded-[32px] border p-4 sm:p-6 lg:p-8"
        style={{
          borderColor: "var(--border)",
          background:
            "linear-gradient(145deg, color-mix(in srgb, var(--surface) 94%, transparent), color-mix(in srgb, var(--surface-2) 92%, transparent))",
          boxShadow:
            "0 24px 70px rgba(var(--shadow-color), 0.16), inset 0 1px 0 rgba(255,255,255,0.08)",
        }}
      >
        <div
          className="absolute inset-x-8 top-0 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(var(--brand-rgb), 0.7), transparent)",
          }}
        />

        <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
          <div
            className="relative overflow-hidden rounded-[26px] border p-5 sm:p-6 lg:p-8"
            style={{
              borderColor:
                "color-mix(in srgb, var(--color-brand-500) 24%, var(--border))",
              background:
                "linear-gradient(160deg, rgba(var(--brand-rgb), 0.16), color-mix(in srgb, var(--surface) 88%, transparent) 48%, color-mix(in srgb, var(--surface-2) 94%, transparent))",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.08), inset 0 -22px 60px rgba(var(--shadow-color), 0.12)",
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.16]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(var(--brand-rgb),0.34) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--brand-rgb),0.22) 1px, transparent 1px)",
                backgroundSize: "34px 34px",
              }}
              aria-hidden="true"
            />

            <div className="relative space-y-5">
              <div className="flex items-center justify-between gap-3">
                <span
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold text-[var(--title)]"
                  style={{
                    borderColor:
                      "color-mix(in srgb, var(--color-brand-500) 30%, var(--border))",
                    background:
                      "color-mix(in srgb, var(--surface) 76%, transparent)",
                  }}
                >
                  <span
                    className="h-2 w-2 rounded-full animate-pulse"
                    style={{ background: "var(--color-brand-500)" }}
                  />
                  {submitting ? "Validating..." : "Ready to redeem"}
                </span>

                <TicketCheck className="h-5 w-5 text-[var(--color-brand-500)]" />
              </div>

              <div>
                <label
                  htmlFor="redeem-code"
                  className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--muted)]"
                >
                  Release/Voucher code
                </label>

                <div
                  className="mt-3 rounded-3xl border p-3"
                  style={{
                    borderColor: "var(--border)",
                    background:
                      "linear-gradient(180deg, color-mix(in srgb, var(--surface) 88%, transparent), color-mix(in srgb, var(--surface-2) 84%, transparent))",
                  }}
                >
                  <div
                    className="flex min-h-[82px] items-center gap-4 rounded-2xl border px-4 transition focus-within:border-[var(--color-brand-500)] focus-within:ring-4 focus-within:ring-[rgba(var(--brand-rgb),0.14)]"
                    style={{
                      borderColor: "var(--border)",
                      background: "var(--surface)",
                    }}
                  >
                    <WalletCards className="h-5 w-5 shrink-0 text-[var(--color-brand-500)]" />
                    <input
                      id="redeem-code"
                      value={code}
                      onChange={(event) => updateCode(event.target.value)}
                      placeholder="------"
                      maxLength={CODE_MAX_LENGTH}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      className="min-w-0 flex-1 bg-transparent text-center text-2xl font-semibold tracking-[0.26em] text-[var(--title)] outline-none placeholder:text-[var(--muted)] sm:text-3xl"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3" aria-label="Voucher keypad">
                {keypadRows.flat().map((digit) => (
                  <KeypadButton
                    key={digit}
                    onClick={() => appendDigit(digit)}
                    disabled={submitting || normalizedCode.length >= CODE_MAX_LENGTH}
                    ariaLabel={`Enter ${digit}`}
                  >
                    {digit}
                  </KeypadButton>
                ))}

                <KeypadButton
                  onClick={clearCode}
                  disabled={submitting || normalizedCode.length === 0}
                  accent
                  ariaLabel="Clear voucher code"
                >
                  Clear
                </KeypadButton>

                <KeypadButton
                  onClick={() => appendDigit("0")}
                  disabled={submitting || normalizedCode.length >= CODE_MAX_LENGTH}
                  ariaLabel="Enter 0"
                >
                  0
                </KeypadButton>

                <KeypadButton
                  onClick={removeLastDigit}
                  disabled={submitting || normalizedCode.length === 0}
                  accent
                  ariaLabel="Backspace voucher code"
                >
                  <span className="inline-flex items-center gap-2">
                    <Delete className="h-4 w-4" />
                    <span className="hidden sm:inline">Backspace</span>
                    <span className="sm:hidden">Back</span>
                  </span>
                </KeypadButton>
              </div>

              <p className="text-sm leading-6 text-[var(--muted)]">
                Tap the keypad or type the voucher number with your keyboard.
                Clear resets the code before submission.
              </p>
            </div>
          </div>

          <div
            className="rounded-[26px] border p-6 sm:p-8 lg:p-10"
            style={{
              borderColor: "var(--border)",
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--surface) 98%, transparent), color-mix(in srgb, var(--surface-2) 92%, transparent))",
            }}
          >
            <div className="flex h-full flex-col">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div
                    className="inline-flex h-12 w-12 items-center justify-center rounded-2xl text-[var(--color-brand-500)]"
                    style={{ background: "rgba(var(--brand-rgb), 0.12)" }}
                  >
                    <Fingerprint className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-3xl font-semibold tracking-normal text-[var(--title)] sm:text-4xl">
                    Redeem a voucher
                  </h2>
                  <p className="mt-3 max-w-xl text-base leading-7 text-[var(--paragraph)]">
                    Enter a valid voucher code to add quota to your account.
                  </p>
                </div>

                <div
                  className="w-full rounded-2xl border px-4 py-3 sm:w-auto sm:min-w-[150px] sm:text-right"
                  style={{
                    borderColor: "var(--border)",
                    background: "var(--surface-2)",
                  }}
                >
                  <p className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
                    Current Quota
                  </p>
                  <p className="mt-1 whitespace-nowrap text-xl font-semibold text-[var(--title)]">
                    {loadingBalance ? "Loading" : formatQuota(balance)}
                  </p>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  ["1", "Enter voucher code"],
                  ["2", "Validate securely"],
                  ["3", "Add quota"],
                ].map(([step, label]) => (
                  <div
                    key={step}
                    className="rounded-2xl border p-4"
                    style={{
                      borderColor: "var(--border)",
                      background: "color-mix(in srgb, var(--surface-2) 72%, transparent)",
                    }}
                  >
                    <span
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-semibold"
                      style={{
                        background: "rgba(var(--brand-rgb), 0.12)",
                        color: "var(--color-brand-600)",
                      }}
                    >
                      {step}
                    </span>
                    <p className="mt-3 text-sm font-semibold text-[var(--title)]">
                      {label}
                    </p>
                  </div>
                ))}
              </div>

              {message ? (
                <div
                  className="mt-6 flex items-start gap-3 rounded-2xl border px-4 py-4 text-sm"
                  style={{
                    borderColor:
                      messageTone === "success"
                        ? "color-mix(in srgb, var(--color-support-500) 26%, var(--border))"
                        : "color-mix(in srgb, var(--color-brand-600) 26%, var(--border))",
                    background:
                      messageTone === "success"
                        ? "color-mix(in srgb, var(--color-support-500) 10%, var(--surface))"
                        : "color-mix(in srgb, var(--color-brand-500) 10%, var(--surface))",
                    color:
                      messageTone === "success"
                        ? "color-mix(in srgb, var(--color-support-700) 76%, var(--title))"
                        : "color-mix(in srgb, var(--color-brand-700) 82%, var(--title))",
                  }}
                >
                  {messageTone === "success" ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                  ) : (
                    <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                  )}
                  <span className="leading-6">{message}</span>
                </div>
              ) : null}

              <div className="mt-auto pt-8">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="h-16 w-full text-base font-semibold sm:text-lg"
                  disabled={isDisabled}
                  iconRight={
                    submitting ? (
                      <Loader2 className="relative z-10 h-5 w-5 animate-spin" />
                    ) : (
                      <ArrowRight className="relative z-10 h-5 w-5" />
                    )
                  }
                >
                  {submitting ? "Redeeming" : "Redeem Code"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </section>
  );
};

export default RedeemCardBox;
