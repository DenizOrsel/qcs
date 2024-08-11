import Link from "next/link";
import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "@radix-ui/react-icons";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed text-white left-0 top-0 flex w-full justify-center border-b border-gray-300 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-600 lg:p-4 lg:dark:bg-zinc-800/30">
          Nfield&nbsp;
          <code className="font-mono font-bold">A/B Testing</code>
        </p>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          <a
            className="pointer-events-none flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
            href="https://nipo.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Region EU
          </a>
        </div>
      </div>
      <div className="flex items-center justify-center gap-4">
        <Link href="/login">
          <Button className="flex items-center justify-center">
            QC System <ArrowRightIcon className="ml-2" />
          </Button>
        </Link>
        <Button className="flex items-center justify-center" disabled>
          IP Reports
        </Button>
        <Button className="flex items-center justify-center" disabled>
          Visualization
        </Button>
      </div>
    </main>
  );
}
