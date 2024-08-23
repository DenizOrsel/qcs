import { Manrope } from "next/font/google";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import { DarkModeProvider } from "@/context/DarkModeContext";
import { AppProvider } from "@/context/AppContext";
import DarkModeToggle from "@/components/DarkModeToggle";
import TokenRefresher from "@/components/TokenRefresher";
import SettingsIcon from "@/components/SettingsIcon";
import LogoutButton from "@/components/ui/LogoutButton";
import { useRouter } from "next/router";

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
  const router = useRouter();

  // Check if the current route is the root route
  const isHiddenRoute = ["/", "/login", "/setup"].includes(router.pathname);

  return (
    <AppProvider>
      <DarkModeProvider>
        <div
          className={cn("antialiased", fontHeading.variable, fontBody.variable)}
        >
          <DarkModeToggle />
          <TokenRefresher />
          {!isHiddenRoute && <LogoutButton />}
          {!isHiddenRoute && <SettingsIcon />}
          <Component {...pageProps} />
        </div>
      </DarkModeProvider>
    </AppProvider>
  );
}
