"use client";

import Button from "@/components/ui/button/Button";
import { apiPublicGet } from "@/services/api";
import { CheckCircle2, Printer, RotateCw } from "lucide-react";
import { useEffect, useState } from "react";

type PrinterScreenData = {
  printer: {
    id: string;
    name: string;
    model: string;
    status: string;
    location: string;
    queueName: string;
    pendingCount: number;
  };
};

const Page = () => {
  const [printerData, setPrinterData] = useState<PrinterScreenData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const refreshPrinter = async () => {
    const data = await apiPublicGet<PrinterScreenData>("/printer-screen");
    setPrinterData(data);
  };

  useEffect(() => {
    let mounted = true;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshPrinter()
      .catch((requestError) => {
        if (!mounted) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load printer status.",
        );
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="card p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-center gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-md bg-brand-500/10 text-brand-600">
                <Printer className="h-8 w-8" />
              </span>
              <div>
                <h1 className="text-3xl font-semibold text-[var(--title)]">
                  {printerData?.printer.name || "HP Printer"}
                </h1>
                <p className="paragraph mt-1">
                  {printerData?.printer.model || "Physical printer release"}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              iconLeft={<RotateCw className="h-4 w-4" />}
              disabled={loading}
              onClick={() => {
                setLoading(true);
                refreshPrinter().finally(() => setLoading(false));
              }}
            >
              Refresh Status
            </Button>
          </div>

          {error ? (
            <p className="mt-5 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </p>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <p className="text-sm text-[var(--muted)]">Status</p>
              <p className="mt-1 text-lg font-semibold text-[var(--title)]">
                {printerData?.printer.status || "Loading"}
              </p>
            </div>
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <p className="text-sm text-[var(--muted)]">Backend queue</p>
              <p className="mt-1 text-lg font-semibold text-[var(--title)]">
                {printerData?.printer.pendingCount ?? 0} waiting
              </p>
            </div>
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <p className="text-sm text-[var(--muted)]">Queue</p>
              <p className="mt-1 truncate text-lg font-semibold text-[var(--title)]">
                {printerData?.printer.queueName || "Default"}
              </p>
            </div>
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface-2)] p-4">
              <p className="text-sm text-[var(--muted)]">Location</p>
              <p className="mt-1 truncate text-lg font-semibold text-[var(--title)]">
                {printerData?.printer.location || "Printer area"}
              </p>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <div className="flex items-start gap-4">
            <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-green-500/10 text-green-700">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-2xl font-semibold text-[var(--title)]">
                Release happens on the physical printer
              </h2>
              <p className="paragraph mt-2">
                After a user uploads a PDF, Alpha Queue sends it to the HP as a private stored job. On the printer touchscreen, open the stored/private jobs list, select the user/job, enter the PIN shown after upload, then print it from the printer panel.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-md border border-[var(--border)] p-4">
              <p className="text-sm font-semibold text-[var(--title)]">1. Upload</p>
              <p className="paragraph mt-2">
                The web app sends the PDF to the HP as a held private job.
              </p>
            </div>
            <div className="rounded-md border border-[var(--border)] p-4">
              <p className="text-sm font-semibold text-[var(--title)]">2. Go to HP panel</p>
              <p className="paragraph mt-2">
                Use the printer touchscreen, not this web page, to find the held job.
              </p>
            </div>
            <div className="rounded-md border border-[var(--border)] p-4">
              <p className="text-sm font-semibold text-[var(--title)]">3. Enter PIN</p>
              <p className="paragraph mt-2">
                Type the job PIN on the HP panel and release the document there.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Page;
