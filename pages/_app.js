import { Manrope } from "next/font/google";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { DarkModeProvider } from "@/context/DarkModeContext";
import DarkModeToggle from "@/components/DarkModeToggle";
import TokenRefresher from "@/components/TokenRefresher";

const fontHeading = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

const fontBody = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export default function App({ Component, pageProps }) {
  return (
    <DarkModeProvider>
      <div
        className={cn("antialiased", fontHeading.variable, fontBody.variable)}
      >
        <DarkModeToggle />
        <TokenRefresher />
        <Component {...pageProps} />
      </div>
    </DarkModeProvider>
  );
}
