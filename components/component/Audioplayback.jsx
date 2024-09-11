import React, { useState, useEffect, useRef } from "react";
import ReactHowler from "react-howler";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";

export default function Audioplayback({ audioSrc, downloadedFiles, onQuestionChange }) {
  const [playing, setPlaying] = useState(false);
  const [seek, setSeek] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const howlerRef = useRef(null);
  const [muted, setMuted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  let cumulativeTime = 0;
  const markers = downloadedFiles[0].content.map((item) => {
    const startTime = cumulativeTime;
    cumulativeTime += parseFloat(item.ElapsedTime);
    return {
      startTime: startTime,
      endTime: cumulativeTime,
      label: item.QuestionId,
    };
  });

   const processQuestionId = (questionId) => {
     const match = questionId.match(/Q\d+/);
     return match ? match[0] : questionId; 
   };

  useEffect(() => {
    const currentMarker = markers.find(
      (marker) => seek > marker.startTime && seek < marker.endTime
    );

    if (currentMarker) {
      onQuestionChange(processQuestionId(currentMarker.label));
    }
  }, [seek, markers, onQuestionChange]);

    const handleSearchQueryChange = (e) => {
      const query = e.target.value;
      setSearchQuery(query);

      const marker = markers.find((m) =>
        m.label.toLowerCase().startsWith(query.toLowerCase())
      );
      if (marker && howlerRef.current) {
        howlerRef.current.seek(marker.startTime);
        setSeek(marker.startTime);
        onQuestionChange(processQuestionId(marker.label));
      }
    };

  const rainbowColors = [
    "red",
    "orange",
    "yellow",
    "green",
    "indigo",
    "violet",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      if (howlerRef.current) {
        setSeek(howlerRef.current.seek());
        setDuration(howlerRef.current.duration());
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const togglePlayPause = () => {
    setPlaying(!playing);
  };

  const handleSliderChange = (value) => {
    if (howlerRef.current) {
      howlerRef.current.seek(value);
      setSeek(value);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60) || 0;
    const secs = Math.floor(seconds % 60) || 0;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleOnEnd = () => {
    setPlaying(false);
    setSeek(0);
  };

  const toggleMute = () => {
    setMuted(!muted);
    howlerRef.current.mute(!muted);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 bg-background border-t border-muted shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1),0_-2px_4px_-2px_rgba(0,0,0,0.1)] flex justify-center items-center">
      {/* Search Input */}
      <div className="flex items-center gap-2">
        <Input
          type="text"
          value={searchQuery}
          onChange={handleSearchQueryChange}
          placeholder="Jump to question"
          className="mt-4"
        />
      </div>
      <div className="container px-4 py-3 flex items-center gap-4">
        {/* Play/Pause Button */}
        <Button variant="ghost" size="icon" onClick={togglePlayPause}>
          {playing ? (
            <CircleStopIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5" />
          )}
        </Button>

        {/* Slider */}
        <div className="flex-1 mx-4 mt-3 relative">
          <Slider
            className="w-full cursor-grab z-10 [&>span:first-child]:h-1 [&>span:first-child]:bg-primary/30 [&_[role=slider]]:bg-primary [&_[role=slider]]:w-3 [&_[role=slider]]:h-3 [&_[role=slider]]:border-0 [&>span:first-child_span]:bg-primary [&_[role=slider]:focus-visible]:ring-0 [&_[role=slider]:focus-visible]:ring-offset-0 [&_[role=slider]:focus-visible]:scale-105 [&_[role=slider]:focus-visible]:transition-transform"
            value={[seek]}
            max={duration}
            onValueChange={([value]) => handleSliderChange(value)}
          />

          {markers.map((marker, index) => {
            const start = marker.startTime;
            const end = marker.endTime;
            const left = (start / duration) * 100;
            const width = ((end - start) / duration) * 100;
            const color = rainbowColors[index % rainbowColors.length];

            return (
              <div
                key={index}
                style={{
                  position: "absolute",
                  left: `${left}%`,
                  width: `${width}%`,
                  height: "100%",
                  backgroundColor: color,
                  opacity: 0.5,
                  zIndex: 1,
                }}
              />
            );
          })}
          {markers.map((marker, index) => (
            <div
              key={index}
              style={{
                position: "absolute",
                left: `${(marker.startTime / duration) * 100}%`,
                transform: "translateX(-50%)",
                top: "-10px",
                zIndex: 2,
                pointerEvents: "none",
                display: "flex",
                alignItems: "center",
                flexDirection: "column",
              }}
            >
              {/* Triangle pointing right */}
              <div
                className="text-primary"
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "6px solid",
                  borderTop: "6px solid transparent",
                  borderBottom: "6px solid transparent",
                  marginTop: "18px",
                  marginLeft: "7px",
                }}
              ></div>
              {/* Question label */}
              <div
                className="text-primary"
                style={{
                  fontSize: "10px",
                  marginLeft: "26px",
                  marginTop: "0px",
                }}
              >
                {marker.label}
              </div>
            </div>
          ))}
        </div>

        {/* Duration and Volume Control */}
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground mt-2">
            {formatTime(seek)} / {formatTime(duration)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="w-8 h-8 mt-3"
            onClick={toggleMute}
          >
            {muted ? (
              <VolumeXIcon className="w-7 h-7 mt-2 ml-2" />
            ) : (
              <Volume2Icon className="w-5 h-5" />
            )}
          </Button>
          <Slider
            className="w-24 mt-3 cursor-grab"
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={([value]) => setVolume(value)}
          />
        </div>
      </div>
      <ReactHowler
        src={audioSrc}
        playing={playing}
        volume={volume}
        ref={howlerRef}
        onEnd={handleOnEnd}
        muted={muted}
      />
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

function VolumeXIcon(props) {
  return (
    <svg
      {...props}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.72361 1.05279C7.893 1.13749 8 1.31062 8 1.5V13.5C8 13.6894 7.893 13.8625 7.72361 13.9472C7.55421 14.0319 7.35151 14.0136 7.2 13.9L3.33333 11H1.5C0.671573 11 0 10.3284 0 9.5V5.5C0 4.67158 0.671573 4 1.5 4H3.33333L7.2 1.1C7.35151 0.986371 7.55421 0.968093 7.72361 1.05279ZM7 2.5L3.8 4.9C3.71345 4.96491 3.60819 5 3.5 5H1.5C1.22386 5 1 5.22386 1 5.5V9.5C1 9.77614 1.22386 10 1.5 10H3.5C3.60819 10 3.71345 10.0351 3.8 10.1L7 12.5V2.5ZM14.8536 5.14645C15.0488 5.34171 15.0488 5.65829 14.8536 5.85355L13.2071 7.5L14.8536 9.14645C15.0488 9.34171 15.0488 9.65829 14.8536 9.85355C14.6583 10.0488 14.3417 10.0488 14.1464 9.85355L12.5 8.20711L10.8536 9.85355C10.6583 10.0488 10.3417 10.0488 10.1464 9.85355C9.95118 9.65829 9.95118 9.34171 10.1464 9.14645L11.7929 7.5L10.1464 5.85355C9.95118 5.65829 9.95118 5.34171 10.1464 5.14645C10.3417 4.95118 10.6583 4.95118 10.8536 5.14645L12.5 6.79289L14.1464 5.14645C14.3417 4.95118 14.6583 4.95118 14.8536 5.14645Z"
        fill="currentColor"
        fill-rule="evenodd"
        clip-rule="evenodd"
      ></path>
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
