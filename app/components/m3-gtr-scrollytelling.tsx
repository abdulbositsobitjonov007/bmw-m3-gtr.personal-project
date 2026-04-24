"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

const TOTAL_FRAMES = 100;
const RUN_ID = "pre-fix";

function debugLog(
  location: string,
  message: string,
  hypothesisId: string,
  data: Record<string, unknown>
) {
  fetch("http://127.0.0.1:7900/ingest/83cec6bb-e2eb-4e96-b9d1-7babb35bf5d3", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "284181",
    },
    body: JSON.stringify({
      sessionId: "284181",
      runId: RUN_ID,
      hypothesisId,
      location,
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}

function frameSources(index: number) {
  const number = String(index + 1).padStart(3, "0");
  return [`/frames/frame-${number}.png`];
}

function isDrawableImage(image?: HTMLImageElement | null) {
  if (!image) return false;
  return image.complete && image.naturalWidth > 0 && image.naturalHeight > 0;
}

export default function M3GtrScrollytelling() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loadedCount, setLoadedCount] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.14], [1, 0]);
  const sequenceProgress = useTransform(scrollYProgress, [0, 0.8], [0, 1], {
    clamp: true,
  });

  const currentFrame = useMemo(() => {
    if (!images.length) return 0;
    const safeLoadedCount = Math.max(1, loadedCount);
    return Math.max(0, Math.min(images.length - 1, safeLoadedCount - 1));
  }, [images.length, loadedCount]);

  useEffect(() => {
    let active = true;
    const nextImages: HTMLImageElement[] = [];

    for (let i = 0; i < TOTAL_FRAMES; i += 1) {
      const img = new Image();
      const sources = frameSources(i);
      let sourceIndex = 0;

      img.onerror = () => {
        sourceIndex += 1;
        // #region agent log
        debugLog("m3-gtr-scrollytelling.tsx:68", "image onerror", "H1", {
          frame: i,
          sourceIndex,
          hasFallback: sourceIndex < sources.length,
          failingSrc: img.currentSrc || img.src,
        });
        // #endregion
        if (sourceIndex < sources.length) {
          img.src = sources[sourceIndex];
        }
      };
      img.onload = () => {
        if (!active) return;
        // #region agent log
        debugLog("m3-gtr-scrollytelling.tsx:80", "image onload", "H2", {
          frame: i,
          src: img.currentSrc || img.src,
          complete: img.complete,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        });
        // #endregion
        setLoadedCount((count) => count + 1);
      };
      img.src = sources[sourceIndex];
      nextImages.push(img);
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setImages(nextImages);
    return () => {
      active = false;
    };
  }, []);

  const drawImage = (image: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    // #region agent log
    debugLog("m3-gtr-scrollytelling.tsx:103", "drawImage precheck", "H3", {
      src: image.currentSrc || image.src,
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
    });
    // #endregion

    if (!isDrawableImage(image)) {
      // #region agent log
      debugLog("m3-gtr-scrollytelling.tsx:117", "drawImage skipped invalid image", "H3", {
        src: image.currentSrc || image.src,
        complete: image.complete,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      });
      // #endregion
      return;
    }

    const viewportWidth = canvas.clientWidth || window.innerWidth;
    const viewportHeight = canvas.clientHeight || window.innerHeight;
    const scale = Math.max(
      viewportWidth / image.naturalWidth,
      viewportHeight / image.naturalHeight
    );
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const x = (viewportWidth - drawWidth) / 2;
    const y = (viewportHeight - drawHeight) / 2;

    context.clearRect(0, 0, viewportWidth, viewportHeight);
    context.drawImage(image, x, y, drawWidth, drawHeight);
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext("2d");
    if (!context) return;
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(dpr, dpr);
  };

  useEffect(() => {
    if (!images.length) return;

    const firstLoaded = images.find((img) => isDrawableImage(img));
    // #region agent log
    debugLog("m3-gtr-scrollytelling.tsx:145", "firstLoaded selection", "H4", {
      imagesLength: images.length,
      foundFirstLoaded: Boolean(firstLoaded),
      firstLoadedSrc: firstLoaded?.currentSrc || firstLoaded?.src || null,
      firstLoadedNaturalWidth: firstLoaded?.naturalWidth ?? null,
      firstLoadedNaturalHeight: firstLoaded?.naturalHeight ?? null,
    });
    // #endregion
    if (!firstLoaded) return;

    resizeCanvas();
    drawImage(firstLoaded);

    const onResize = () => {
      resizeCanvas();
      const image = images[currentFrame];
      if (isDrawableImage(image)) {
        drawImage(image);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [images, currentFrame]);

  useMotionValueEvent(sequenceProgress, "change", (latest) => {
    if (!images.length) return;
    const index = Math.min(
      images.length - 1,
      Math.floor(latest * (images.length - 1))
    );
    const image = images[index];
    // #region agent log
    debugLog("m3-gtr-scrollytelling.tsx:170", "scroll frame selected", "H5", {
      latest,
      index,
      complete: image?.complete ?? false,
      src: image?.currentSrc || image?.src || null,
      naturalWidth: image?.naturalWidth ?? null,
      naturalHeight: image?.naturalHeight ?? null,
    });
    // #endregion
    if (isDrawableImage(image)) {
      drawImage(image);
    }
  });

  return (
    <>
      <section ref={sectionRef} className="relative h-[500vh] bg-black">
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
          <canvas ref={canvasRef} className="h-screen w-full" />
          <div className="pointer-events-none absolute inset-0 bg-linear-to-r from-[#0b2d66]/20 via-transparent to-[#3a1111]/15" />

          <motion.h1
            style={{ opacity: heroOpacity }}
            className="pointer-events-none absolute left-1/2 top-1/2 z-10 w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 bg-linear-to-r from-white via-[#78afff] to-[#ff5252] bg-clip-text px-6 text-center text-4xl font-semibold tracking-[0.25em] text-transparent md:text-6xl"
          >
            THE LEGEND
          </motion.h1>
        </div>
      </section>
    </>
  );
}
