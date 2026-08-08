import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../components/theme-provider";
import { BodyWrapper } from "@/components/body-wrapper";
import { ThemeManager } from "@/components/theme-manager";
import { THEMES, DEFAULT_THEME } from "@/lib/themes";

// Applies the persisted color theme and wallpaper before first paint, both to
// avoid a flash and to keep SSR/client markup identical (no localStorage on the
// server would otherwise cause a hydration mismatch).
const themeVars = JSON.stringify(
  Object.fromEntries(Object.values(THEMES).map((t) => [t.id, t.vars])),
);
const themeWallpapers = JSON.stringify(
  Object.fromEntries(Object.values(THEMES).map((t) => [t.id, t.wallpaper ?? ""])),
);
const themeBootstrap = `(function(){try{var t=localStorage.getItem('theme');var r=document.documentElement;var m=${themeVars};var v=m[t]||m['${DEFAULT_THEME}'];for(var k in v){r.style.setProperty(k,v[k]);}var w=${themeWallpapers};var img=localStorage.getItem('wallpaper')||w[t]||w['${DEFAULT_THEME}'];if(img){r.style.setProperty('--wallpaper','url('+img+')');}}catch(e){}})();`;

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// Kept under ~160 characters: Google truncates around there, and this string
// is also the OpenGraph and Twitter card description. The long-form bio lives
// in components/renders/about-me.tsx, which is what visitors actually read.
const description =
  "Gaurav Ahuja — backend engineer at Joveo, CSE at IIT Mandi. I build distributed services with Java, Spring Boot and Kafka on AWS, plus AI side projects.";

export const metadata: Metadata = {
  title: "Gaurav Ahuja",
  description,
  openGraph: {
    title: "Gaurav Ahuja",
    description,
    siteName: "Gaurav Ahuja",
    type: "website",
    images: [
      {
        url: "/wallpapers/mountain.jpg",
        width: 1200,
        height: 675,
        alt: "Gaurav Ahuja",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gaurav Ahuja",
    description,
    images: ["/wallpapers/mountain.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <BodyWrapper className={`${jetbrains.className} antialiased bg-cover`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeManager />
          {children}
        </ThemeProvider>
      </BodyWrapper>
    </html>
  );
}
