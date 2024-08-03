import { Manrope } from "next/font/google";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";


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
    <div className={cn(
          'antialiased',
          fontHeading.variable,
          fontBody.variable
        )}>
      <Component {...pageProps} />
    </div>
  );
}
