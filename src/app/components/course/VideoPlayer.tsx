import React, { useState, useCallback, useEffect, forwardRef, useRef } from "react";
import { Box, IconButton, Slider, Typography } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import ReplayIcon from "@mui/icons-material/Replay";
import YouTube from "react-youtube";

const getYouTubeVideoId = (url: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

/* ================= COMPONENTE VIDEOPOPUP (INTERNAL) ================= */
const Videopopup = ({ videoUrl, onPlayerReady, onYouTubeStateChange }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoId = getYouTubeVideoId(videoUrl);
  const isYT = !!videoId;

  const opts = {
    playerVars: {
      autoplay: 0,
      controls: 0,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      iv_load_policy: 3,
      disablekb: 1,
      fs: 0, // Deshabilitar botón nativo de pantalla completa
      origin: typeof window !== 'undefined' ? window.location.origin : '',
    },
  };

  const handleReady = useCallback(
    (e: any) => {
      onPlayerReady?.(e.target);
    },
    [onPlayerReady]
  );

  const handleStateChange = useCallback(
    (e: any) => {
      onYouTubeStateChange?.(e.data);
    },
    [onYouTubeStateChange]
  );

  if (!videoUrl) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#000",
        overflow: "hidden",
        "& .yt-root": {
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
        },
        "& .yt-iframe": {
          width: "100%",
          height: "100%",
        },
      }}
    >
      {isYT ? (
        <YouTube
          videoId={videoId}
          opts={opts}
          className="yt-root"
          iframeClassName="yt-iframe"
          onReady={handleReady}
          onStateChange={handleStateChange}
        />
      ) : (
        <video
          ref={videoRef}
          src={videoUrl}
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            position: "relative",
            zIndex: 1,
          }}
        />
      )}

      {/* 🛡️ Franja invisible para bloquear clics arriba - DESPUÉS del player para estar encima */}
      {isYT && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "60px", 
            zIndex: 10,
            backgroundColor: "transparent",
            cursor: "default",
            pointerEvents: "auto",
          }}
        />
      )}
    </Box>
  );
};

/* ================= COMPONENTE PRINCIPAL ================= */
const VideoPlayer = forwardRef<HTMLDivElement, { videoUrl: string; thumbnail?: string; onVideoCompleted?: () => void }>(
  ({ videoUrl, thumbnail, onVideoCompleted }, ref) => {
    const [player, setPlayer] = useState<any>(null);
    const [isPaused, setIsPaused] = useState(true);
    const [volume, setVolume] = useState(100);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [hover, setHover] = useState(false);
    const [showMobileControls, setShowMobileControls] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    
    const videoId = getYouTubeVideoId(videoUrl);
    const autoThumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : thumbnail;
    
    const isDragging = useRef(false);
    const intervalRef = useRef<any>(null);
    const controlsTimeoutRef = useRef<any>(null);

    const toggleMobileControls = () => {
      setShowMobileControls(true);
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
      controlsTimeoutRef.current = setTimeout(() => {
        setShowMobileControls(false);
      }, 3000);
    };

    /* ================= RESET SEGURO ================= */
    useEffect(() => {
      setIsCompleted(false);
      setHasStarted(false);
      setProgress(0);
      setCurrentTime(0);
      setIsPaused(true);
      
      if (player && typeof player.stopVideo === 'function' && player.getIframe?.()) {
        try {
          player.stopVideo();
        } catch (e) {
          // Error silencioso
        }
      }
    }, [videoUrl, player]);

    /* ================= UTILS ================= */
    const formatTime = (s: number) => {
      if (!s || isNaN(s)) return "00:00";
      const m = Math.floor(s / 60);
      const sec = Math.floor(s % 60);
      return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
    };

    const startGlobalTimer = useCallback((p: any) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (p && typeof p.getCurrentTime === 'function' && p.getIframe?.() && !isDragging.current) {
          const t = p.getCurrentTime();
          const d = p.getDuration();
          if (d > 0) {
            setCurrentTime(t);
            setDuration(d);
            setProgress((t / d) * 100);
          }
        }
      }, 150);
    }, []);

    /* ================= PLAYER HANDLERS ================= */
    const handlePlayerReady = useCallback((p: any) => {
      setPlayer(p);
      if (p && typeof p.getDuration === 'function') {
        setDuration(p.getDuration() || 0);
        p.setVolume(volume);
        startGlobalTimer(p);
      }
    }, [volume, startGlobalTimer]);

    const handleYTState = useCallback((state: number) => {
      if (!player) return;
      
      if (state === 1) { 
        setIsPaused(false);
        setIsCompleted(false);
        setHasStarted(true);
      } else if (state === 2 || state === -1) { 
        setIsPaused(true);
      } else if (state === 0) { 
        setIsPaused(true);
        setIsCompleted(true);
        setProgress(100);
        onVideoCompleted?.();
      }
    }, [player, onVideoCompleted]);

    /* ================= CONTROL ACTIONS ================= */
    const handlePlayPause = () => {
      if (!player || typeof player.getPlayerState !== 'function') return;
      if (isCompleted) {
        player.seekTo(0);
        player.playVideo();
        setIsCompleted(false);
      } else {
        const state = player.getPlayerState();
        state === 1 ? player.pauseVideo() : player.playVideo();
      }
    };

    const handleSliderChange = (event: any, newValue: any) => {
      isDragging.current = true;
      setProgress(newValue);
      if (duration > 0) {
        setCurrentTime((newValue / 100) * duration);
      }
    };

    const handleSeekCommit = (_: any, v: any) => {
      if (!player || typeof player.seekTo !== 'function') return;
      const t = (v / 100) * duration;
      player.seekTo(t, true);
      setTimeout(() => { isDragging.current = false; }, 600);
      if (v < 99) setIsCompleted(false);
    };

    const handleVolumeChange = (_: any, v: any) => {
      setVolume(v);
      if (player && typeof player.setVolume === 'function') {
        player.setVolume(v);
        if (v > 0 && player.isMuted?.()) player.unMute();
      }
    };

    useEffect(() => {
      return () => { 
        if (intervalRef.current) clearInterval(intervalRef.current); 
      };
    }, []);

    const showControls = hasStarted && (isPaused || hover || isCompleted || showMobileControls);

    return (
      <Box
        ref={ref}
        sx={{
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundColor: "black",
          overflow: "hidden",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        onClick={toggleMobileControls}
      >
        <Box sx={{ position: "absolute", inset: 0 }}>
          {/* Capa de inicio (Big Play Button) */}
          {!hasStarted && !isCompleted && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                zIndex: 30,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                background: autoThumbnail ? `url("${autoThumbnail}") center/cover no-repeat` : "rgba(0,0,0,0.1)"
              }}
              onClick={() => {
                if (player) player.playVideo();
                setHasStarted(true);
              }}
            >
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,0,0,0.9)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.2s",
                  "&:hover": { transform: "scale(1.1)" }
                }}
              >
                <PlayArrowIcon sx={{ fontSize: 50, color: "white", ml: 0.5 }} />
              </Box>
            </Box>
          )}

          <Videopopup
            videoUrl={videoUrl}
            onPlayerReady={handlePlayerReady}
            onYouTubeStateChange={handleYTState}
          />

          {/* 🛡️ Franja protectora superior (título y compartir) */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "70px",
              zIndex: 35,
              backgroundColor: "transparent",
              pointerEvents: "auto",
            }}
          />

          {/* 🛡️ Franja protectora inferior (logo y ver en youtube) */}
          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "70px",
              zIndex: 35,
              backgroundColor: "transparent",
              pointerEvents: "auto",
            }}
          />

          {isCompleted && (
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.85)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 40,
                color: "white",
                cursor: "pointer"
              }}
              onClick={handlePlayPause}
            >
              <ReplayIcon sx={{ fontSize: 70, mb: 1 }} />
              <Typography variant="h6">Ver de nuevo</Typography>
            </Box>
          )}

          <Box
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 50,
              p: 2,
              display: "flex",
              gap: 2,
              alignItems: "center",
              color: "#fff",
              background: "linear-gradient(transparent, rgba(0,0,0,.9))",
              opacity: showControls ? 1 : 0,
              visibility: hasStarted ? "visible" : "hidden",
              transition: "opacity .3s, visibility .3s",
              pointerEvents: showControls ? "auto" : "none",
            }}
          >
            <IconButton onClick={handlePlayPause} color="inherit">
              {isCompleted ? <ReplayIcon sx={{ fontSize: 30 }} /> : 
               isPaused ? <PlayArrowIcon sx={{ fontSize: 30 }} /> : <PauseIcon sx={{ fontSize: 30 }} />}
            </IconButton>

            <Typography sx={{ minWidth: 85, fontSize: "0.85rem", fontVariantNumeric: "tabular-nums" }}>
              {formatTime(currentTime)} / {formatTime(duration)}
            </Typography>

            <Slider
              value={progress}
              onChange={handleSliderChange}
              onChangeCommitted={handleSeekCommit}
              sx={{ 
                flex: 1, 
                color: "#ff0000",
                '& .MuiSlider-thumb': { width: 14, height: 14 },
                '& .MuiSlider-rail': { opacity: 0.3 }
              }}
            />

            <IconButton onClick={() => {
               if (!player) return;
               if (player.isMuted()) { player.unMute(); setVolume(100); }
               else { player.mute(); setVolume(0); }
            }} color="inherit">
              {volume === 0 ? <VolumeOffIcon /> : <VolumeUpIcon />}
            </IconButton>

            <Slider
              value={volume}
              onChange={handleVolumeChange}
              sx={{ width: 80, color: "#fff" }}
            />

            <IconButton color="inherit" onClick={() => (ref as any).current?.requestFullscreen()}>
              <FullscreenIcon />
            </IconButton>
          </Box>
        </Box>
      </Box>
    );
  }
);

export default VideoPlayer;
