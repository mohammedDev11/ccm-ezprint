import { ThemeProvider } from "next-themes";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EzPrint",
  description: "Premium print management workspace for campus operations.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="data-theme"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* <NavbarShell>{children}</NavbarShell> */}
        </ThemeProvider>
      </body>
    </html>
  );
}
