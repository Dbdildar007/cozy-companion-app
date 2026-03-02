import { useRef, useEffect, useState, useCallback } from "react";
import {
  Play,
  Pause,
  SkipForward,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  videoUrl: string | null;
  title: string;
  onEnded?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
  autoPlay?: boolean;
}

const VideoPlayer = ({
  videoUrl,
  title,
  onEnded,
  onNext,
  hasNext = false,
  autoPlay = false,
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setMuted(videoRef.current.muted);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current) return;
    const pct =
      (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(pct);

    // Show next overlay in last 10 seconds
    const remaining =
      videoRef.current.duration - videoRef.current.currentTime;
    if (remaining <= 10 && hasNext && !showNextOverlay) {
      setShowNextOverlay(true);
      setCountdown(Math.ceil(remaining));
    }
    if (remaining <= 10 && hasNext) {
      setCountdown(Math.ceil(remaining));
    }
  }, [hasNext, showNextOverlay]);

  const handleEnded = useCallback(() => {
    setPlaying(false);
    setShowNextOverlay(false);
    if (hasNext && onNext) {
      onNext();
    } else {
      onEnded?.();
    }
  }, [hasNext, onNext, onEnded]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!videoRef.current) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const pct = x / rect.width;
      videoRef.current.currentTime = pct * videoRef.current.duration;
    },
    []
  );

  const handleMouseMove = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (playing) setShowControls(false);
    }, 3000);
  }, [playing]);

  useEffect(() => {
    if (autoPlay && videoRef.current && videoUrl) {
      videoRef.current.play().then(() => setPlaying(true)).catch(() => {});
    }
  }, [autoPlay, videoUrl]);

  useEffect(() => {
    setShowNextOverlay(false);
    setProgress(0);
    setPlaying(false);
  }, [videoUrl]);

  if (!videoUrl) {
    return (
      <div className="relative aspect-video bg-card rounded-lg flex flex-col items-center justify-center gap-4 border border-border">
        <AlertTriangle className="w-12 h-12 text-[hsl(var(--cine-gold))]" />
        <p className="text-lg font-semibold text-foreground">
          Video Not Available
        </p>
        <p className="text-sm text-muted-foreground text-center max-w-md px-4">
          This content is not available right now. The video link has not been
          added to the database yet. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-background rounded-lg overflow-hidden group cursor-pointer"
      onMouseMove={handleMouseMove}
      onClick={togglePlay}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full h-full object-contain bg-background"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        playsInline
      />

      {/* Controls overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-background/30 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <div className="absolute top-4 left-4">
          <p className="text-sm font-semibold text-foreground drop-shadow">
            {title}
          </p>
        </div>

        {/* Center play button */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center hover:bg-primary transition-colors"
            >
              <Play className="w-7 h-7 text-primary-foreground ml-1" />
            </button>
          </div>
        )}

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          {/* Progress bar */}
          <div
            className="w-full h-1.5 bg-muted rounded-full cursor-pointer group/bar"
            onClick={(e) => {
              e.stopPropagation();
              handleSeek(e);
            }}
          >
            <div
              className="h-full bg-primary rounded-full relative transition-all"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-primary opacity-0 group-hover/bar:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="p-1.5 hover:bg-accent rounded-md transition-colors"
              >
                {playing ? (
                  <Pause className="w-5 h-5 text-foreground" />
                ) : (
                  <Play className="w-5 h-5 text-foreground" />
                )}
              </button>
              {hasNext && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onNext?.();
                  }}
                  className="p-1.5 hover:bg-accent rounded-md transition-colors"
                >
                  <SkipForward className="w-5 h-5 text-foreground" />
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute();
                }}
                className="p-1.5 hover:bg-accent rounded-md transition-colors"
              >
                {muted ? (
                  <VolumeX className="w-5 h-5 text-foreground" />
                ) : (
                  <Volume2 className="w-5 h-5 text-foreground" />
                )}
              </button>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFullscreen();
              }}
              className="p-1.5 hover:bg-accent rounded-md transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-5 h-5 text-foreground" />
              ) : (
                <Maximize className="w-5 h-5 text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Next episode overlay */}
      {showNextOverlay && hasNext && (
        <div
          className="absolute bottom-20 right-4 bg-card/95 backdrop-blur border border-border rounded-lg p-4 shadow-xl"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-xs text-muted-foreground mb-2">
            Next episode in {countdown}s
          </p>
          <Button
            size="sm"
            onClick={() => {
              setShowNextOverlay(false);
              onNext?.();
            }}
            className="gap-1.5"
          >
            <SkipForward className="w-4 h-4" />
            Play Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
