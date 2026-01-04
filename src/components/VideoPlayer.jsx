import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  BsPlayFill,
  BsPauseFill,
  BsVolumeUp,
  BsVolumeMute,
  BsFullscreen,
  BsFullscreenExit,
  BsGear,
  BsPip,
  BsArrowsAngleExpand,
  BsArrowsAngleContract,
} from "react-icons/bs";
import { MdForward10, MdReplay10, MdPictureInPicture } from "react-icons/md";

function VideoPlayer({ src, poster, onTheaterModeChange, theaterMode = false }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressRef = useRef(null);
  const volumeRef = useRef(null);
  const hideControlsTimeout = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [hoverTime, setHoverTime] = useState(null);
  const [hoverPosition, setHoverPosition] = useState(0);
  const [isPiP, setIsPiP] = useState(false);

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Format time (seconds to MM:SS or HH:MM:SS)
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Toggle play/pause
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  }, [isPlaying]);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  // Handle volume change
  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  // Handle progress bar click
  const handleProgressClick = (e) => {
    if (progressRef.current && videoRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      videoRef.current.currentTime = percent * duration;
    }
  };

  // Handle progress bar hover
  const handleProgressHover = (e) => {
    if (progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      setHoverTime(percent * duration);
      setHoverPosition(e.clientX - rect.left);
    }
  };

  // Seek forward/backward
  const seek = useCallback((seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(
        0,
        Math.min(duration, videoRef.current.currentTime + seconds)
      );
    }
  }, [duration]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    
    if (!container || !video) return;

    // Check if we're currently in fullscreen
    const isCurrentlyFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      video.webkitDisplayingFullscreen
    );

    if (!isCurrentlyFullscreen) {
      // Enter fullscreen
      // Try container fullscreen first (works on most browsers)
      if (container.requestFullscreen) {
        container.requestFullscreen();
      } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
      } 
      // iOS Safari: use video element's native fullscreen
      else if (video.webkitEnterFullscreen) {
        video.webkitEnterFullscreen();
      } else if (video.webkitSupportsFullscreen) {
        video.webkitEnterFullscreen();
      }
    } else {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (video.webkitExitFullscreen) {
        video.webkitExitFullscreen();
      }
    }
  }, []);

  // Toggle Picture-in-Picture
  const togglePiP = useCallback(async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        setIsPiP(false);
      } else if (videoRef.current) {
        await videoRef.current.requestPictureInPicture();
        setIsPiP(true);
      }
    } catch (error) {
      console.error("PiP error:", error);
    }
  }, []);

  // Change playback speed
  const changeSpeed = (speed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
      setShowSettings(false);
    }
  };

  // Toggle theater mode
  const toggleTheaterMode = () => {
    if (onTheaterModeChange) {
      onTheaterModeChange(!theaterMode);
    }
  };

  // Show controls temporarily
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    if (isPlaying) {
      hideControlsTimeout.current = setTimeout(() => {
        setShowControls(false);
        setShowSettings(false);
        setShowSpeedMenu(false);
      }, 3000);
    }
  }, [isPlaying]);

  // Video event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleTimeUpdate = () => setCurrentTime(video.currentTime);
    const handleLoadedMetadata = () => setDuration(video.duration);
    const handleWaiting = () => setIsBuffering(true);
    const handlePlaying = () => setIsBuffering(false);
    const handleEnded = () => {
      setIsPlaying(false);
      setShowControls(true);
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("ended", handleEnded);
    };
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const video = videoRef.current;
    
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        video?.webkitDisplayingFullscreen
      );
      setIsFullscreen(isCurrentlyFullscreen);
    };

    // Standard fullscreen events
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    
    // iOS Safari specific events
    if (video) {
      video.addEventListener("webkitbeginfullscreen", () => setIsFullscreen(true));
      video.addEventListener("webkitendfullscreen", () => setIsFullscreen(false));
    }

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      if (video) {
        video.removeEventListener("webkitbeginfullscreen", () => setIsFullscreen(true));
        video.removeEventListener("webkitendfullscreen", () => setIsFullscreen(false));
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle if video player is focused or is fullscreen
      if (!containerRef.current?.contains(document.activeElement) && !isFullscreen) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "arrowleft":
        case "j":
          e.preventDefault();
          seek(-10);
          break;
        case "arrowright":
        case "l":
          e.preventDefault();
          seek(10);
          break;
        case "arrowup":
          e.preventDefault();
          setVolume((prev) => {
            const newVol = Math.min(1, prev + 0.1);
            if (videoRef.current) videoRef.current.volume = newVol;
            return newVol;
          });
          break;
        case "arrowdown":
          e.preventDefault();
          setVolume((prev) => {
            const newVol = Math.max(0, prev - 0.1);
            if (videoRef.current) videoRef.current.volume = newVol;
            return newVol;
          });
          break;
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          e.preventDefault();
          if (videoRef.current) {
            videoRef.current.currentTime = (parseInt(e.key) / 10) * duration;
          }
          break;
        default:
          break;
      }
      showControlsTemporarily();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, toggleFullscreen, toggleMute, seek, duration, isFullscreen, showControlsTemporarily]);

  // Auto-play on load
  useEffect(() => {
    if (videoRef.current && src) {
      videoRef.current.play().catch(() => {
        // Auto-play was prevented
        setIsPlaying(false);
      });
    }
  }, [src]);

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`relative group bg-black rounded-xl overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : ""
      }`}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={(e) => {
        if (e.target === e.currentTarget || e.target === videoRef.current) {
          togglePlay();
        }
      }}
      tabIndex={0}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-contain"
        playsInline
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
      />

      {/* Buffering Indicator */}
      {isBuffering && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
        </div>
      )}

      {/* Center Play Button (shown when paused) */}
      {!isPlaying && !isBuffering && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity"
        >
          <div className="w-20 h-20 bg-black/70 rounded-full flex items-center justify-center hover:bg-black/80 transition">
            <BsPlayFill className="text-white text-5xl ml-1" />
          </div>
        </button>
      )}

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 flex flex-col justify-end transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0"
        }`}
      >
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>

        {/* Controls Container */}
        <div className="relative z-10 px-3 pb-3">
          {/* Progress Bar */}
          <div
            ref={progressRef}
            className="relative h-1 bg-white/30 rounded-full cursor-pointer group/progress mb-3 hover:h-1.5 transition-all"
            onClick={handleProgressClick}
            onMouseMove={handleProgressHover}
            onMouseLeave={() => setHoverTime(null)}
          >
            {/* Buffer Progress */}
            <div className="absolute inset-y-0 left-0 bg-white/50 rounded-full" style={{ width: "0%" }}></div>
            
            {/* Play Progress */}
            <div
              className="absolute inset-y-0 left-0 bg-red-600 rounded-full"
              style={{ width: `${progressPercent}%` }}
            >
              {/* Scrubber */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full scale-0 group-hover/progress:scale-100 transition-transform"></div>
            </div>

            {/* Hover Time Tooltip */}
            {hoverTime !== null && (
              <div
                className="absolute -top-8 transform -translate-x-1/2 bg-black/90 text-white text-xs px-2 py-1 rounded"
                style={{ left: hoverPosition }}
              >
                {formatTime(hoverTime)}
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="flex items-center justify-between gap-2">
            {/* Left Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="p-2 text-white hover:bg-white/20 rounded-full transition"
              >
                {isPlaying ? (
                  <BsPauseFill className="text-xl sm:text-2xl" />
                ) : (
                  <BsPlayFill className="text-xl sm:text-2xl" />
                )}
              </button>

              {/* Rewind 10s */}
              <button
                onClick={() => seek(-10)}
                className="p-2 text-white hover:bg-white/20 rounded-full transition hidden sm:block"
              >
                <MdReplay10 className="text-xl sm:text-2xl" />
              </button>

              {/* Forward 10s */}
              <button
                onClick={() => seek(10)}
                className="p-2 text-white hover:bg-white/20 rounded-full transition hidden sm:block"
              >
                <MdForward10 className="text-xl sm:text-2xl" />
              </button>

              {/* Volume */}
              <div className="flex items-center group/volume">
                <button
                  onClick={toggleMute}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition"
                >
                  {isMuted || volume === 0 ? (
                    <BsVolumeMute className="text-xl sm:text-2xl" />
                  ) : (
                    <BsVolumeUp className="text-xl sm:text-2xl" />
                  )}
                </button>
                <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-200">
                  <input
                    ref={volumeRef}
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="w-16 ml-1 accent-white cursor-pointer"
                  />
                </div>
              </div>

              {/* Time Display */}
              <div className="text-white text-xs sm:text-sm ml-2">
                <span>{formatTime(currentTime)}</span>
                <span className="mx-1">/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-1">
              {/* Settings */}
              <div className="relative">
                <button
                  onClick={() => {
                    setShowSettings(!showSettings);
                    setShowSpeedMenu(false);
                  }}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition"
                >
                  <BsGear className="text-lg sm:text-xl" />
                </button>

                {/* Settings Menu */}
                {showSettings && (
                  <div className="absolute bottom-full right-0 mb-2 w-48 bg-gray-900/95 rounded-lg overflow-hidden shadow-xl">
                    <button
                      onClick={() => {
                        setShowSpeedMenu(true);
                        setShowSettings(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-3 text-white text-sm hover:bg-white/10 transition"
                    >
                      <span>Playback Speed</span>
                      <span className="text-gray-400">{playbackSpeed}x</span>
                    </button>
                  </div>
                )}

                {/* Speed Menu */}
                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-2 w-36 bg-gray-900/95 rounded-lg overflow-hidden shadow-xl max-h-64 overflow-y-auto">
                    {speedOptions.map((speed) => (
                      <button
                        key={speed}
                        onClick={() => changeSpeed(speed)}
                        className={`w-full px-4 py-2.5 text-sm text-left transition ${
                          playbackSpeed === speed
                            ? "bg-white/20 text-white"
                            : "text-gray-300 hover:bg-white/10"
                        }`}
                      >
                        {speed === 1 ? "Normal" : `${speed}x`}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Picture-in-Picture */}
              {document.pictureInPictureEnabled && (
                <button
                  onClick={togglePiP}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition hidden sm:block"
                  title="Picture-in-Picture"
                >
                  <BsPip className="text-lg sm:text-xl" />
                </button>
              )}

              {/* Theater Mode */}
              {onTheaterModeChange && (
                <button
                  onClick={toggleTheaterMode}
                  className="p-2 text-white hover:bg-white/20 rounded-full transition hidden lg:block"
                  title="Theater Mode"
                >
                  {theaterMode ? (
                    <BsArrowsAngleContract className="text-lg sm:text-xl" />
                  ) : (
                    <BsArrowsAngleExpand className="text-lg sm:text-xl" />
                  )}
                </button>
              )}

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 text-white hover:bg-white/20 rounded-full transition"
              >
                {isFullscreen ? (
                  <BsFullscreenExit className="text-lg sm:text-xl" />
                ) : (
                  <BsFullscreen className="text-lg sm:text-xl" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Double-tap to seek indicators (for touch) */}
      <div className="absolute inset-0 flex pointer-events-none">
        <div className="flex-1 flex items-center justify-center opacity-0">
          <MdReplay10 className="text-white text-5xl" />
        </div>
        <div className="flex-1 flex items-center justify-center opacity-0">
          <MdForward10 className="text-white text-5xl" />
        </div>
      </div>
    </div>
  );
}

export default VideoPlayer;
