import type { Metadata, Viewport } from "next";
import "./globals.css";
import ServiceWorkerRegister from "@/components/service-worker-register";
import PageViewTracker from "@/components/page-view-tracker";
import NotificationBell from "@/components/notification-bell";

export const metadata: Metadata = {
  title: "ExpertNet Pakistan — MEP, HVAC, Commercial Kitchen & Technical Industry Network",
  description:
    "Pakistan's national directory, marketplace and lead platform for MEP, HVAC and Commercial Kitchen professionals. Powered by Standard Fabrication – Techno Engineering Services.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icons/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1F3A",
};

const MOBILE_NAV = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/ai-advisor", label: "AI Advisor" },
  { href: "/requirements/new", label: "Requirements" },
  { href: "/login", label: "Account" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <ServiceWorkerRegister />
        <PageViewTracker />
        <header className="bg-navy text-white">
          <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
            <span className="font-bold text-lg tracking-wide">
              EXPERTNET <span className="text-gold-light">PAKISTAN</span>
            </span>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <a href="/search" className="hover:text-gold-light">Search</a>
              <a href="/ai-advisor" className="hover:text-gold-light">AI Advisor</a>
              <a href="/requirements/new" className="hover:text-gold-light">Post Requirement</a>
              <a href="/login" className="hover:text-gold-light">Login</a>
              <NotificationBell />
            </nav>
          </div>
        </header>
        <main className="flex-1 pb-16 md:pb-0">{children}</main>
        <footer className="bg-navy text-white text-xs hidden md:block">
          <div className="mx-auto max-w-6xl px-4 py-6 text-center">
            <p>MEP • HVAC • COMMERCIAL KITCHEN • TECHNICAL INDUSTRY</p>
            <p className="mt-1 text-gold-light">
              Powered by Standard Fabrication – Techno Engineering Services
            </p>
          </div>
        </footer>
        <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t flex justify-around py-2 text-[11px] text-navy">
          {MOBILE_NAV.map((item) => (
            <a key={item.href} href={item.href} className="flex flex-col items-center gap-0.5 px-2">
              {item.label}
            </a>
          ))}
        </nav>
      </body>
    </html>
  );
}
