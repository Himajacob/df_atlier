import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Alex_Brush, Jost } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const alexBrush = Alex_Brush({
  variable: "--font-alex-brush",
  subsets: ["latin"],
  weight: ["400"],
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Atelier | daffodilz Boutique Management",
  description:
    "Internal tool for daffodilz 2.0 to track custom orders, Aari work, bridal wear and partywear commissions.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Atelier",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f241a",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const session = await getSession();

  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${alexBrush.variable} ${jost.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <header className="sticky top-0 z-20 border-b border-gold/30 bg-cream/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/df_logo.png"
                alt="daffodilz"
                width={44}
                height={31}
                className="h-8 w-auto"
                priority
              />
              <span className="font-[var(--font-alex-brush)] text-2xl text-gold-dark">
                Atelier
              </span>
            </Link>
            {session && (
              <nav className="flex items-center gap-5 font-sans text-sm tracking-wide text-forest/80">
                <Link
                  href="/"
                  className="transition-colors hover:text-gold-dark"
                >
                  Dashboard
                </Link>
                {session.role === "admin" && (
                  <Link
                    href="/admin/users"
                    className="transition-colors hover:text-gold-dark"
                  >
                    Users
                  </Link>
                )}
                <Link
                  href="/account"
                  className="transition-colors hover:text-gold-dark"
                >
                  {session.username}
                </Link>
                <LogoutButton />
                <Link
                  href="/works/new"
                  className="rounded-full bg-forest px-4 py-2 text-cream transition-colors hover:bg-forest-light"
                >
                  + New Work
                </Link>
              </nav>
            )}
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
          {children}
        </main>
        <footer className="border-t border-gold/30 py-6 text-center font-sans text-xs text-forest/60">
          daffodilz Atelier — internal boutique management
        </footer>
      </body>
    </html>
  );
}
