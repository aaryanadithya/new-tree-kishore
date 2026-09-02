import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

// Drop your track in /public/music.mp3 (or change the src below).
// Autoplay is blocked by most browsers until the user interacts with
// the page at least once — this mirrors the original's fallback of
// waiting for the first click.
export default function BackgroundMusic({ src = "/music.mp3" }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    const tryPlay = () => audio.play().catch(() => {});
    tryPlay();

    const onFirstInteraction = () => {
      tryPlay();
      document.removeEventListener("click", onFirstInteraction);
    };
    document.addEventListener("click", onFirstInteraction, { once: true });

    return () => document.removeEventListener("click", onFirstInteraction);
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (playing) audio.pause();
    else audio.play().catch(() => {});
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={src}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        onClick={toggle}
        aria-label={playing ? "Mute background music" : "Play background music"}
        title={playing ? "Mute music" : "Play music"}
        className="fixed bottom-5 right-5 z-30 flex h-11 w-11 items-center justify-center rounded-full bg-slate-900/80 text-white shadow-lg backdrop-blur transition hover:scale-105 active:scale-95"
      >
        {playing ? <Volume2 size={18} /> : <VolumeX size={18} />}
      </button>
    </>
  );
}
