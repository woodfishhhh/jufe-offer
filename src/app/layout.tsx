import type { Metadata } from "next";
import { Manrope, Syne } from "next/font/google";
import { AuthProvider } from "@/components/auth-provider";
import { Glitch } from "@/components/canvasui/Glitch";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { AppToaster } from "@/components/toaster";
import { getSiteUrl, site } from "@/data/site";
import "./globals.css";

const optimizedIcon = `/_next/image?url=${encodeURIComponent(site.logoSrc)}&w=64&q=75`;

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: site.name,
    template: `%s · ${site.name}`,
  },
  description: `${site.tagline}${site.description}`,
  applicationName: site.name,
  openGraph: {
    title: site.name,
    description: site.tagline,
    locale: "zh_CN",
    type: "website",
    siteName: site.name,
  },
  icons: {
    icon: [{ url: optimizedIcon, sizes: "64x64" }],
    apple: [
      {
        url: `/_next/image?url=${encodeURIComponent(site.logoSrc)}&w=256&q=75`,
        sizes: "256x256",
      },
    ],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      data-scroll-behavior="smooth"
      className={`${syne.variable} ${manrope.variable} h-full scroll-smooth antialiased`}
    >
      <body className="bg-background text-foreground selection:bg-foreground selection:text-background flex min-h-full flex-col font-sans">
        <AuthProvider>
          <SiteHeader />
          <Glitch className="relative flex min-h-0 flex-1 flex-col">
            <main className="min-h-0 flex-1">{children}</main>
            <SiteFooter />
          </Glitch>
          <AppToaster />
        </AuthProvider>
      </body>
    </html>
  );
}
