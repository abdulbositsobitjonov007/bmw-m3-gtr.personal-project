"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

const reveal = {
  initial: { opacity: 0, y: 48 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
};

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="bg-linear-to-r from-white via-[#6aa8ff] to-[#ff4d4d] bg-clip-text text-3xl font-black uppercase tracking-tighter text-transparent md:text-5xl">
      {children}
    </h2>
  );
}

export default function M3GtrSections() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const finalVideoRef = useRef<HTMLVideoElement | null>(null);
  const legacyVideoRef = useRef<HTMLVideoElement | null>(null);
  const galleryVideoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showFinalVideo, setShowFinalVideo] = useState(false);
  const [hasLegacyVideoActivated, setHasLegacyVideoActivated] = useState(false);
  const [hasGalleryVideoActivated, setHasGalleryVideoActivated] = useState(false);
  const isLegacyVideoInView = useInView(legacyVideoRef, { amount: 0.35 });
  const isGalleryVideoInView = useInView(galleryVideoRef, { amount: 0.35 });
  const enableLegacyVideo = hasLegacyVideoActivated || isLegacyVideoInView;
  const enableGalleryVideo = hasGalleryVideoActivated || isGalleryVideoInView;

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
      return;
    }

    audio.pause();
    setIsPlaying(false);
  };

  const waveformPattern = useMemo(
    () => [12, 24, 16, 40, 20, 34, 15, 28, 18, 38, 14, 30, 19, 36],
    []
  );

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleEnded = () => {
      setIsPlaying(false);
    };
    const handlePlay = () => {
      setIsPlaying(true);
    };
    const handlePause = () => {
      setIsPlaying(false);
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  useEffect(() => {
    if (!enableLegacyVideo) return;
    const video = legacyVideoRef.current;
    if (!video) return;
    if (isLegacyVideoInView) {
      void video.play().catch(() => {});
      return;
    }
    video.pause();
  }, [enableLegacyVideo, isLegacyVideoInView]);

  useEffect(() => {
    if (!enableGalleryVideo) return;
    const video = galleryVideoRef.current;
    if (!video) return;
    if (isGalleryVideoInView) {
      void video.play().catch(() => {});
      return;
    }
    video.pause();
  }, [enableGalleryVideo, isGalleryVideoInView]);

  useEffect(() => {
    if (!showFinalVideo) return;
    const video = finalVideoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play().catch(() => {});
  }, [showFinalVideo]);

  const handleFinalVideoEnded = () => {
    setShowFinalVideo(false);
  };

  return (
    <div className="bg-[#050505] text-white">
      <motion.section
        {...reveal}
        className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-24 md:grid-cols-2 md:gap-20 md:px-10 lg:py-32"
      >
        <div className="space-y-8">
          <SectionHeading>BORN ON THE TRACK. IMMORTALIZED IN CODE.</SectionHeading>
          <p className="max-w-xl text-lg leading-8 text-neutral-400">
            Built in 2001 with a single purpose: absolute dominance. The M3 GTR
            was so fast that racing regulations had to be rewritten just to stop
            it.
          </p>
        </div>
        <div className="mx-auto w-full max-w-md overflow-hidden rounded-2xl border border-[#6aa8ff]/30 bg-white/5 shadow-[0_0_60px_rgba(16,88,255,0.2)]">
          <video
            ref={legacyVideoRef}
            className="aspect-4/5 h-full w-full object-cover"
            muted
            loop
            playsInline
            preload={enableLegacyVideo ? "metadata" : "none"}
            onMouseEnter={() => setHasLegacyVideoActivated(true)}
            onTouchStart={() => setHasLegacyVideoActivated(true)}
            onCanPlay={() => setHasLegacyVideoActivated(true)}
          >
            <source src="/BMW M3 GTR video.mp4" type="video/mp4" />
          </video>
        </div>
      </motion.section>

      <motion.section
        {...reveal}
        style={{ backgroundImage: "url('/engine info.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
        className="w-full relative py-24 lg:py-32"
      >
        <div className="absolute inset-0 bg-linear-to-br from-black/50 via-black/30 to-black/50 ">
        </div>
        <div className="mx-auto w-full max-w-7xl px-6 md:px-10">
          <div className="mb-10 z-10">
            <SectionHeading>THE HEART</SectionHeading>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              "Engine: 4.0L V8 P60",
              "Power: 493 HP",
              "Weight: 1,120 kg",
              "Redline: 8,000 RPM",
            ].map((spec) => (
              <div key={spec} className="rounded-xl border border-[#6aa8ff]/20 bg-white/5 p-8 backdrop-blur-sm">
                <p className="text-sm uppercase tracking-[0.2em] text-neutral-400">Spec</p>
                <p className="mt-4 text-2xl font-black uppercase tracking-tight text-white">{spec}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section {...reveal} style={{backgroundImage: "url('/carbon gtr.jpg')", backgroundAttachment: "fixed", backgroundSize: "cover", backgroundPosition: "center"}} className="relative ">
        <div className="relative h-[80vh] w-full overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-black/90 via-black/40 to-black/90"></div>
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
            <div className="max-w-4xl space-y-6">
              <SectionHeading>CARBON FIBER MASTERY.</SectionHeading>
              <p className="text-xl text-neutral-300">
                Form dictated strictly by downforce.
              </p>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        {...reveal}
        className="mx-auto flex w-full max-w-6xl flex-col items-center px-6 py-24 text-center md:px-10 lg:py-32"
      >
        <SectionHeading>STRAIGHT-CUT GEARS. THE SOUND OF NIGHTMARES.</SectionHeading>
        <audio ref={audioRef} preload="metadata">
          <source src="/Everything_racing_M3_gtr_straight_cut_gears.mp3" type="audio/mpeg" />
        </audio>
        <button
          type="button"
          onClick={togglePlayback}
          aria-label={isPlaying ? "Pause soundtrack" : "Play soundtrack"}
          className="mt-12 cursor-pointer h-20 w-20 rounded-full border border-[#6aa8ff]/50 text-lg font-semibold text-white transition hover:scale-105 hover:border-[#ff4d4d] hover:shadow-[0_0_40px_rgba(73,140,255,0.35)]"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>
        <div className="mt-10 flex h-20 w-full max-w-3xl items-end justify-center gap-2">
          {Array.from({ length: 28 }).map((_, i) => (
            <motion.span
              key={i}
              className="w-1.5 rounded-full bg-[#6aa8ff]"
              animate={
                isPlaying
                  ? {
                      height: [
                        waveformPattern[i % waveformPattern.length],
                        waveformPattern[(i + 3) % waveformPattern.length] + 10,
                        waveformPattern[(i + 5) % waveformPattern.length],
                      ],
                      opacity: [0.45, 1, 0.5],
                    }
                  : { height: 10, opacity: 0.35 }
              }
              transition={{
                duration: 0.7 + (i % 6) * 0.1,
                repeat: isPlaying ? Number.POSITIVE_INFINITY : 0,
                ease: "easeInOut",
                delay: isPlaying ? i * 0.02 : 0,
              }}
            />
          ))}
        </div>
      </motion.section>

      <motion.section {...reveal} className="mx-auto w-full max-w-7xl px-6 py-24 md:px-10 lg:py-32">
        <div className="mb-10">
          <SectionHeading>GALLERY</SectionHeading>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-4 md:grid-rows-2">
          <div className="group overflow-hidden rounded-sm border border-[#6aa8ff]/20 bg-white/5 md:col-span-2 md:row-span-1">
            <Image src={"/xLWYcF.jpg"} alt="BMW M3 GTR race shot" width={500} height={500} sizes="(min-width: 768px) 50vw, 100vw" className="w-full h-full object-cover" />
          </div>
          <div className="group overflow-hidden rounded-sm border border-[#ff4d4d]/20 bg-white/5 md:col-span-1 md:row-span-2">
            <Image src={"/123416041-bmw-m3-gtr-e46-need-for-speed.jpg"} alt="BMW M3 GTR vertical wallpaper" width={500} height={500} sizes="(min-width: 768px) 25vw, 100vw" className="w-full h-full object-cover" / >
          </div>
          <div className="group overflow-hidden rounded-sm border border-[#6aa8ff]/20 bg-white/5 md:col-span-1 md:row-span-1">
            <video
              ref={galleryVideoRef}
              src="/mini gtr vid.mp4"
              muted
              loop
              playsInline
              preload={enableGalleryVideo ? "metadata" : "none"}
              onMouseEnter={() => setHasGalleryVideoActivated(true)}
              onTouchStart={() => setHasGalleryVideoActivated(true)}
              className="h-full w-full object-cover"
            >
              <source src="/mini gtr vid.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="group overflow-hidden rounded-sm border border-[#ff4d4d]/20 bg-white/5 md:col-span-2 md:row-span-1">
            <Image src={"/HD-wallpaper-bmw-m3-gtr-germany-gtr-bmw-car.jpg"} alt="BMW M3 GTR studio wallpaper" width={500} height={500} sizes="(min-width: 768px) 50vw, 100vw" className="w-full h-full object-cover" />
          </div>
          <div className="group overflow-hidden rounded-sm border border-[#6aa8ff]/20 bg-white/5 md:col-span-1 md:row-span-1">
            <Image
              src={"/images.webp"}
              alt="BMW M3 GTR close-up"
              width={500}
              height={500}
              sizes="(min-width: 768px) 25vw, 100vw"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          </div>
        </div>
      </motion.section>

      <motion.footer
        {...reveal}
        className="relative mx-auto flex w-full max-w-7xl items-center justify-center overflow-hidden px-6 py-24 text-center md:px-10 lg:py-32"
      >
        <AnimatePresence mode="wait">
          {!showFinalVideo ? (
            <motion.div
              key="footer-cta"
              initial={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30, filter: "blur(2px)" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center"
            >
              <h2 className="text-5xl font-black uppercase tracking-tighter text-white md:text-8xl">
                THE MOST WANTED.
              </h2>
              <button
                type="button"
                onClick={() => setShowFinalVideo(true)}
                className="mt-12 cursor-pointer border border-[#6aa8ff] px-10 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-[#6aa8ff] hover:text-black"
              >
                START ENGINE
              </button>
              <p className="mt-16 text-sm text-neutral-500">© 2026 BMW M3 GTR Concept.</p>
            </motion.div>
          ) : (
            <motion.div
              key="footer-video"
              initial={{ opacity: 0, scale: 0.96, y: 28 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="w-full"
            >
              <video
                ref={finalVideoRef}
                autoPlay
                playsInline
                controls
                onEnded={handleFinalVideoEnded}
                preload="none"
                className="mx-auto aspect-video w-full max-w-6xl rounded-2xl border border-[#6aa8ff]/30 object-cover shadow-[0_0_80px_rgba(28,102,255,0.28)]"
              >
                <source src="/nfs vid.mp4" type="video/mp4" />
              </video>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.footer>
    </div>
  );
}
