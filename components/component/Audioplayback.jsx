import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

export default function Audioplayback({ audioSrc }) {

  return (
    <div className="fixed inset-x-0 bottom-0 bg-background border-t border-muted shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)] flex justify-center items-center">
      <div className="container px-4 py-3 flex items-center gap-4">
        {/* Control Buttons */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <RewindIcon className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <PlayIcon className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <RewindIcon className="w-5 h-5 rotate-180" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8">
            <CircleStopIcon className="w-5 h-5" />
          </Button>
        </div>

        {/* Slider */}
        <div className="flex-1 mx-4 mt-3">
          <Slider
            className="w-full [&>span:first-child]:h-1 [&>span:first-child]:bg-primary/30 [&_[role=slider]]:bg-primary [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-primary [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform"
            defaultValue={[0]}
          />
        </div>

        {/* Duration and Volume Control */}
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground mt-2">
            0:00 / 0 seconds
          </div>
          <Button variant="ghost" size="icon" className="w-8 h-8 mt-3">
            <Volume2Icon className="w-5 h-5" />
          </Button>
        </div>
      </div>
      {audioSrc && (
        <audio controls>
          <source src={audioSrc} type="audio/mp3" />
          Your browser does not support the audio element.
        </audio>
      )}
    </div>
  );
}

function CircleStopIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <rect width="6" height="6" x="9" y="9" />
    </svg>
  );
}

function PlayIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="6 3 20 12 6 21 6 3" />
    </svg>
  );
}

function RewindIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 19 2 12 11 5 11 19" />
      <polygon points="22 19 13 12 22 5 22 19" />
    </svg>
  );
}

function Volume2Icon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}
