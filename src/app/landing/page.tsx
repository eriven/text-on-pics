"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const HERO_IMAGES: { src: string; alt: string }[] = [
  { src: "/assets/images/drift.webp", alt: "carousel image" },
  { src: "/assets/images/dodge.webp", alt: "carousel image" },
  { src: "/assets/images/lost.webp", alt: "carousel image" },
  { src: "/assets/images/f40.webp", alt: "carousel image" },
  { src: "/assets/images/serenity.webp", alt: "carousel image" },
  { src: "/assets/images/explore.webp", alt: "carousel image" },
  { src: "/assets/images/calm.webp", alt: "carousel image" },
];

export default function LandingPage() {
  const scrollerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    let raf = 0;
    let last = performance.now();
    const speedPxPerSec = 40; // gentle auto-scroll

    const step = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      el.scrollLeft += speedPxPerSec * dt;
      // loop when reaching end
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2) {
        el.scrollLeft = 0;
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="min-h-screen bg-[#040B28] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#040B28]/60 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/assets/logos/logo.png"
              alt="Text Behind Image"
              width={28}
              height={28}
              className="rounded"
              priority
            />
            <span className="text-sm font-medium text-white/80">Text Behind Image</span>
          </Link>
          <div className="hidden md:block text-center text-white font-bold text-xs sm:text-sm">
            we are launching on heaven.xyz soon
          </div>
          <Link
            href="/app"
            className="rounded-md bg-white px-4 py-2 text-sm font-medium text-black transition hover:bg-white/90"
          >
            Try It Now — Free & Easy
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-4 pb-6 pt-12 md:pb-10 md:pt-16">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#040B28] px-3 py-1 text-xs text-white/70">
            <span className="inline-flex h-5 items-center rounded-full bg-white/10 px-2 text-[11px] uppercase tracking-wide">New</span>
            <span>No Layers, No BS, Just Fire Visuals</span>
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            Not Another Canva Clone. This Is for Real Creators
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Text-behind effects, done right. Forget layers and clunky tools—this is fast, clean, and
            stress-free. No Photoshop, no stress.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <Link
              href="/app"
              className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
            >
              Try It Now — Free & Easy
            </Link>
            <ul className="flex items-center gap-3 text-xs text-white/60">
              <li className="rounded-full border border-white/10 bg-[#040B28] px-2 py-1">Faster</li>
              <li className="rounded-full border border-white/10 bg-[#040B28] px-2 py-1">Impactful</li>
              <li className="rounded-full border border-white/10 bg-[#040B28] px-2 py-1">Pro Results</li>
            </ul>
          </div>

          {/* Image carousel */}
          <div className="mt-10 overflow-hidden rounded-xl border border-white/10">
            <div
              ref={scrollerRef}
              className="flex gap-4 overflow-x-auto scroll-smooth p-4 [scrollbar-width:none] [-ms-overflow-style:none]"
            >
              {/* hide scrollbar cross-browser */}
              <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
              `}</style>
              {[...HERO_IMAGES, ...HERO_IMAGES].map((img, idx) => (
                <div
                  key={`${img.src}-${idx}`}
                  className="relative h-48 w-[280px] shrink-0 overflow-hidden rounded-lg bg-[#040B28] md:h-64 md:w-[360px]"
                >
                  <Image
                    src={img.src}
                    alt={img.alt}
                    fill
                    sizes="(max-width: 768px) 280px, 360px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Photoshop Who? This Is Faster. */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight md:text-4xl">
            Photoshop Who? This Is Faster.
          </h2>
          <p className="mt-3 max-w-2xl text-white/70">
            No layers, no clutter. Just upload, edit, and create pro-level designs in seconds.
            Fast enough for a school project, sharp enough for client work.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-10">
            {/* Left features */}
            <div className="space-y-8">
              <Feature
                title="Behind 🖼️"
                description="Put text behind any object. No manual masking or layer tricks—just upload and position. That's your secret weapon."
              />
              <Feature
                title="Control 🧠"
                description="Drag, resize, and choose fonts on the fly. Style your text exactly how you imagined—without fighting a million menus."
              />
              <Feature
                title="Draw 🖍️"
                description="Sketch directly onto your photo with brush tools that don't lag or overcomplicate. Because sometimes you just want to scribble something cool."
              />
            </div>

            {/* Centerpiece image */}
            <div className="relative hidden h-[520px] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#040B28] md:block">
              <Image
                src="/assets/images/f1.webp"
                alt="Modern House"
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover"
                priority
              />
            </div>

            {/* Right features */}
            <div className="space-y-8">
              <Feature
                title="Style 🎨"
                description="Add borders, change colors, layer gradients—make it pop or keep it sleek. Your vibe, your way."
              />
              <Feature
                title="StrokeUp 📚"
                description="Use our exclusive StrokeUp border effect. It adds pro-level depth and a trendy aesthetic you won't find anywhere else."
              />
              <Feature
                title="Export 📥"
                description="You made it? Download it. Clean resolution, fast export. No watermark. No waiting."
              />
            </div>
          </div>

          <p className="mt-10 text-sm text-white/50">and much more...</p>
        </section>

        {/* Section: Why Everyone’s Switching */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight md:text-4xl">
            Why Everyone’s Switching
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Stat value="0%" label="Faster than Photoshop" desc="Create professional designs in minutes, not hours" />
            <Stat value="0+" label="Happy Creators" desc="Join thousands of designers who love MagicText" />
            <Stat value="0K+" label="Images Enhanced" desc="Billions of photos transformed with our tools" />
          </div>
        </section>

        {/* Section: Image Behind Image spotlight */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-[#040B28] px-3 py-1 text-xs text-white/70">
            <span className="inline-flex h-5 items-center rounded-full bg-white/10 px-2 text-[11px] uppercase tracking-wide">New Feature</span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight md:text-4xl">Image Behind Image</h2>
          <p className="mt-3 max-w-3xl text-white/70">
            Layer your creativity with precision. Upload additional images and place them perfectly behind your
            main content with intuitive controls.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
            {/* Visual preview column */}
            <div className="flex flex-col gap-5">
              <div className="relative h-72 w-full overflow-hidden rounded-2xl border border-white/10 bg-[#040B28] md:h-[420px]">
                <Image
                  src="/assets/images/spider1.webp"
                  alt="Final image with layered composition"
                  fill
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="flex items-center gap-5">
                <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-[#040B28]">
                  <Image
                    src="/assets/images/f40.webp"
                    alt="Layer thumbnail"
                    fill
                    sizes="160px"
                    className="object-cover"
                  />
                  <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-xs font-medium">2 Layers</span>
                </div>
                <div className="relative h-28 flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#040B28]">
                  <Image
                    src="/assets/images/toolbar2.svg"
                    alt="Image editing toolbar"
                    fill
                    sizes="(min-width: 768px) 30vw, 60vw"
                    className="object-contain p-3"
                  />
                </div>
              </div>
            </div>

            {/* Bullets column */}
            <div className="flex flex-col justify-center gap-8">
              <FeatureBullet
                title="Upload Multiple Images 📁"
                description="Add as many background images as you need. Each upload automatically positions behind your main content for instant layering."
              />
              <FeatureBullet
                title="Smart Layer Management 🎛️"
                description="Control every layer with precision. Adjust opacity, apply 3D tilt effects, flip orientations, and manage the entire stack effortlessly."
              />
              <FeatureBullet
                title="Professional Controls 🎨"
                description="Access the same contextual toolbar that powers text editing. Apply filters, adjust transparency, and create stunning depth with 3D transformations."
              />

              <div className="pt-2">
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center rounded-md bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
                >
                  Try image behind image
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Section: 3D Tilt / Opacity / Instant Preview */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <MiniFeature
              title="3D Tilt Effects 🎯"
              description="Apply horizontal and vertical skew transformations for dynamic, three-dimensional perspectives."
            />
            <MiniFeature
              title="Opacity Control 🔧"
              description="Fine-tune transparency from 0-100% to create perfect blending effects and depth illusions."
            />
            <MiniFeature
              title="Instant Preview 🚀"
              description="See changes in real-time as you edit. No waiting, no rendering delays—just smooth, responsive design."
            />
          </div>
        </section>

        {/* Section: Why Creators Choose Text Behind. */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <h2 className="text-2xl font-semibold tracking-tight md:text-4xl">
            Why Creators Choose Text Behind.
          </h2>
          <p className="mt-3 max-w-3xl text-white/70">
            Pro tools, zero headaches. These features aren’t for messing around—they’re built to create results.
          </p>

          <div className="mt-10 grid grid-cols-1 gap-10 md:grid-cols-2">
            {/* Left copy column */}
            <div className="space-y-6">
              <div className="rounded-2xl border border-white/10 bg-[#040B28] p-6">
                <div className="text-sm font-medium text-white/80">Slide It. Style It.</div>
                <p className="mt-2 text-sm text-white/70">Design in Seconds. Look Like a Pro.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#040B28] p-6">
                <div className="text-sm font-medium text-white/80">Control Every Pixel</div>
                <p className="mt-2 text-sm text-white/70">Type smarter, edit cleaner, style faster.</p>
              </div>
            </div>

            {/* Right comparison block */}
            <Comparison
              lightSrc="/assets/images/camparisone2.webp"
              darkSrc="/assets/images/camparison1.webp"
            />
          </div>

          {/* Toolbox grid */}
          <div className="mt-12 rounded-2xl border border-white/10 bg-[#040B28] p-6">
            <h3 className="text-lg font-semibold">The Toolbox That Actually Helps You Create, Not Just Click</h3>
            <p className="mt-2 text-sm text-white/70">Explore a focused set of tools that keep you moving fast.</p>
            <ToolboxGrid
              items={[
                "Text Behind Object",
                "Font & Style Control",
                "Freehand Drawing",
                "StrokeUp Border",
                "Image Tuning",
                "Brightness & Contrast",
                "Font Weight Adjustments",
                "Gradient Styling",
                "Fast Export",
                "Opacity & Spacing",
                "Layer Deletion",
                "Custom Borders",
                "Drag & Drop Positioning",
              ]}
            />
            <div className="mt-6 relative h-56 w-full overflow-hidden rounded-xl border border-white/10 bg-[#040B28]">
              <Image
                src="/assets/images/toolbar.svg"
                alt="Toolbox preview"
                fill
                sizes="100vw"
                className="object-contain p-6"
              />
            </div>
          </div>
        </section>

        {/* Section: See What Text Behind Can Really Do. */}
        <section className="mx-auto max-w-6xl px-4 py-16" id="gallery">
          <h2 className="text-2xl font-semibold tracking-tight md:text-4xl">
            See What Text Behind Can Really Do.
          </h2>
          <div className="mt-6">
            <h3 className="text-xl font-semibold md:text-2xl">Weekly Finds</h3>
          </div>

          <div className="mt-8 space-y-8">
            <GalleryRow
              images={[
                "/assets/images/zoro.webp",
                "/assets/images/dodge.webp",
                "/assets/images/nostalgic.webp",
                "/assets/images/peace.webp",
                "/assets/images/f40.webp",
                "/assets/images/serenity.webp",
                "/assets/images/explore.webp",
              ]}
            />
            <GalleryRow
              images={[
                "/assets/images/calm.webp",
                "/assets/images/f1.webp",
                "/assets/images/drift.webp",
                "/assets/images/grace.webp",
                "/assets/images/thirsty.webp",
                "/assets/images/speed.webp",
                "/assets/images/lost.webp",
              ]}
            />
            <GalleryRow
              images={[
                "/assets/images/katana.webp",
                "/assets/images/beauty.webp",
                "/assets/images/shoe.webp",
                "/assets/images/timeless.webp",
                "/assets/images/cute.webp",
                "/assets/images/nostalgic.webp",
                "/assets/images/peace.webp",
              ]}
            />
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="#gallery"
              className="rounded-md border border-white/15 bg-[#040B28] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/10"
            >
              View more
            </Link>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-4 py-16">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.03] p-8 text-center">
            <h3 className="text-xl font-semibold md:text-2xl">Ready to Create Something Amazing?</h3>
            <p className="mt-2 text-sm text-white/70">
              Start your creative journey today and join our community of featured creators.
            </p>
            <div className="mt-6">
              <Link
                href="/app"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-white px-5 py-2.5 text-sm font-medium text-black transition hover:bg-white/90"
              >
                Start Creating
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-white/60 md:flex-row">
          <div className="flex items-center gap-2">
            <Image src="/assets/logos/logo.png" alt="logo" width={20} height={20} className="rounded" />
            <span>Text Behind Image</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="https://x.com/textbehindpics" target="_blank" rel="noopener noreferrer">Twitter</Link>
            <Link href="/landing">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#040B28] p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-white/70">{description}</p>
    </div>
  );
}

function Stat({ value, label, desc }: { value: string; label: string; desc: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#040B28] p-6">
      <div className="text-4xl font-extrabold tracking-tight md:text-5xl">{value}</div>
      <h3 className="mt-2 text-base font-semibold">{label}</h3>
      <p className="mt-1 text-sm text-white/60">{desc}</p>
    </div>
  );
}

function FeatureBullet({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#040B28] p-5">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-white/70">{description}</p>
    </div>
  );
}

function MiniFeature({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#040B28] p-6">
      <h3 className="text-base font-semibold md:text-lg">{title}</h3>
      <p className="mt-2 text-sm text-white/70">{description}</p>
    </div>
  );
}

function Comparison({ lightSrc, darkSrc }: { lightSrc: string; darkSrc: string }) {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const src = mode === "light" ? lightSrc : darkSrc;
  return (
    <div className="rounded-2xl border border-white/10 bg-[#040B28] p-4">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setMode("light")}
          className={`rounded-md px-3 py-1 text-xs ${
            mode === "light" ? "bg-white text-black" : "bg-white/10 text-white/80"
          }`}
        >
          Light
        </button>
        <button
          onClick={() => setMode("dark")}
          className={`rounded-md px-3 py-1 text-xs ${
            mode === "dark" ? "bg-white text-black" : "bg-white/10 text-white/80"
          }`}
        >
          Dark
        </button>
      </div>
      <div className="relative mt-4 h-72 w-full overflow-hidden rounded-xl border border-white/10 bg-[#040B28] md:h-[420px]">
        <Image src={src} alt="comparison" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
      </div>
    </div>
  );
}

function ToolboxGrid({ items }: { items: string[] }) {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {items.map((label) => (
        <div
          key={label}
          className="rounded-lg border border-white/10 bg-[#040B28] px-3 py-3 text-xs text-white/80"
        >
          {label}
        </div>
      ))}
    </div>
  );
}

function GalleryRow({ images }: { images: string[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-7">
      {images.map((src) => (
        <div key={src} className="relative aspect-[4/5] w-full overflow-hidden rounded-xl border border-white/10 bg-[#040B28]">
          <Image src={src} alt="gallery" fill sizes="(min-width: 768px) 14vw, 45vw" className="object-cover" />
        </div>
      ))}
    </div>
  );
}


