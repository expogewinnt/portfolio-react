"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState } from "react";
import type { WorkItem } from "@/lib/works";

const SITE_TITLE = "HIROKATSU SUZUKI PORTFOLIO WEB AND VISUAL COMMUNICATION";
const MOBILE_BREAKPOINT = 768;
const SCROLL_SPACE = 120;
const SCROLL_FRICTION = 100;

function decodeHtml(value: string) {
  if (typeof window === "undefined") {
    return value;
  }

  const textarea = document.createElement("textarea");
  textarea.innerHTML = value;
  return textarea.value;
}

function parseHash(length: number) {
  if (typeof window === "undefined") {
    return null;
  }

  const hash = window.location.hash;
  if (!hash) {
    return null;
  }

  const value = Number.parseInt(hash.replace("#", ""), 10);
  if (Number.isNaN(value) || value < 1 || value > length) {
    return null;
  }

  return value - 1;
}

function updateHash(index: number | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (index === null) {
    history.pushState("", document.title, window.location.pathname + window.location.search);
    window.dispatchEvent(new HashChangeEvent("hashchange"));
    return;
  }

  window.location.hash = `#${index + 1}`;
}

function preloadImages(urls: string[], onProgress: (progress: number) => void) {
  let loaded = 0;

  return Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const image = new Image();

          const done = () => {
            loaded += 1;
            onProgress(Math.floor((loaded / urls.length) * 100));
            resolve();
          };

          image.onload = done;
          image.onerror = done;
          image.src = url;
        })
    )
  );
}

function formatChargeForMobile(charge: string) {
  const decoded = decodeHtml(charge);
  return decoded.replace(/■/g, "\n■").trim();
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const update = () => setIsMobile(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);

    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isMobile;
}

function DesktopGallery({
  items,
  activeIndex,
  onSelect,
  onClose
}: {
  items: WorkItem[];
  activeIndex: number | null;
  onSelect: (index: number) => void;
  onClose: () => void;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const smallsRef = useRef<HTMLUListElement>(null);
  const mouseXRef = useRef(0);

  useEffect(() => {
    if (activeIndex !== null) {
      return;
    }

    const content = contentRef.current;
    const smalls = smallsRef.current;
    if (!content || !smalls) {
      return;
    }

    let frameId = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseXRef.current = event.clientX;
    };

    const animate = () => {
      const viewportWidth = window.innerWidth;
      const totalWidth = smalls.scrollWidth;

      if (viewportWidth < totalWidth) {
        const ratio = mouseXRef.current / Math.max(viewportWidth - 1, 1);
        const target = (viewportWidth - (totalWidth + SCROLL_SPACE) - SCROLL_SPACE) * ratio;
        const current = Number.parseFloat(smalls.dataset.left ?? "0");
        const next = current - (current - SCROLL_SPACE - target) / SCROLL_FRICTION;
        smalls.style.left = `${next}px`;
        smalls.dataset.left = `${next}`;
      } else {
        smalls.style.left = "0px";
        smalls.dataset.left = "0";
      }

      frameId = window.requestAnimationFrame(animate);
    };

    content.addEventListener("mousemove", handleMouseMove);
    frameId = window.requestAnimationFrame(animate);

    return () => {
      content.removeEventListener("mousemove", handleMouseMove);
      window.cancelAnimationFrame(frameId);
    };
  }, [activeIndex]);

  return (
    <>
      <div
        className={`overlay ${activeIndex !== null ? "fadeIn" : ""} ${
          activeIndex === null ? "" : "displayBlock"
        }`}
        onClick={onClose}
      >
        <div className="bigsContainer">
          <ul className="bigs">
            {items.map((item, index) => {
              const isActive = activeIndex === index;

              return (
                <li
                  key={item.img}
                  className={`imgObjContainer big ${isActive ? "fadeIn displayBlock" : ""}`}
                >
                  <div className="ttl">{decodeHtml(item.ttl)}</div>
                  <div className="imgContainer">
                    <img src={`/images/big/${item.img}`} alt={decodeHtml(item.ttl)} />
                  </div>
                  <div className="charge">{decodeHtml(item.charge)}</div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="wrapper">
        <header className="portfolioHeader">
          <h1 className="siteTitle">
            HIROKATSU SUZUKI PORTFOLIO
            <br />
            WEB AND VISUAL COMMUNICATION
          </h1>
        </header>
        <div className="content" ref={contentRef}>
          <div className="smallsContainer">
            <ul className="smalls" ref={smallsRef} data-left="0">
              {items.map((item, index) => (
                <li key={item.img} className="imgObjContainer">
                  <button
                    type="button"
                    className="imgContainer small smallFadeIn imgHover buttonReset"
                    style={{ animationDelay: `${0.05 * index}s` }}
                    onClick={() => onSelect(index)}
                    aria-label={decodeHtml(item.ttl)}
                  >
                    <img src={`/images/small/${item.img}`} alt={decodeHtml(item.ttl)} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <footer>
          <p>COPYLIGHT © 2016 HIROKATSU SUZUKI ALL RIGHT RESERVED.</p>
        </footer>
      </div>
    </>
  );
}

function MobileGallery({
  items,
  activeIndex,
  onSelect
}: {
  items: WorkItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  const touchStartX = useRef<number | null>(null);

  const handlePrevious = () => {
    const nextIndex = activeIndex === 0 ? items.length - 1 : activeIndex - 1;
    onSelect(nextIndex);
  };

  const handleNext = () => {
    const nextIndex = activeIndex === items.length - 1 ? 0 : activeIndex + 1;
    onSelect(nextIndex);
  };

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) {
      return;
    }

    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;

    if (Math.abs(delta) < 40) {
      return;
    }

    if (delta > 0) {
      handlePrevious();
      return;
    }

    handleNext();
  };

  return (
    <div className="wrapper mobileWrapper">
      <header className="portfolioHeader">
        <h1 className="siteTitle">
          HIROKATSU SUZUKI PORTFOLIO
          <br />
          WEB AND VISUAL COMMUNICATION
        </h1>
      </header>
      <div className="spsContainer fadeIn displayBlock">
        <ul className="prevNextControler">
          <li className="prev">
            <button type="button" className="navButton" onClick={handlePrevious} aria-label="Previous">
              &#x25C0;
            </button>
          </li>
          <li className="next">
            <button type="button" className="navButton" onClick={handleNext} aria-label="Next">
              &#x25B6;
            </button>
          </li>
        </ul>
        <div className="mobileViewport" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          <ul
            className="sps swiper-wrapper"
            style={{ transform: `translateX(-${activeIndex * 100}%)` }}
          >
            {items.map((item, index) => (
              <li key={item.img} className={`imgObjContainer sp swiper-slide ${index === activeIndex ? "fadeIn" : ""}`}>
                <div className="imgContainer">
                  <img src={`/images/sp/${item.img}`} alt={decodeHtml(item.ttl)} />
                </div>
                <div className="ttl">{decodeHtml(item.ttl)}</div>
                <div className="charge mobileCharge">{formatChargeForMobile(item.charge)}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <footer>
        <p>COPYLIGHT © 2016 HIROKATSU SUZUKI ALL RIGHT RESERVED.</p>
      </footer>
    </div>
  );
}

export function PortfolioGallery({ works }: { works: WorkItem[] }) {
  const isMobile = useIsMobile();
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const galleryItems = useMemo(() => works, [works]);

  useEffect(() => {
    const urls = galleryItems.flatMap((item) =>
      isMobile
        ? [`/images/sp/${item.img}`]
        : [`/images/small/${item.img}`, `/images/big/${item.img}`]
    );

    let cancelled = false;

    preloadImages(urls, (value) => {
      if (!cancelled) {
        setProgress(value);
      }
    }).then(() => {
      if (!cancelled) {
        setIsLoaded(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [galleryItems, isMobile]);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    const syncFromHash = () => {
      const hashIndex = parseHash(galleryItems.length);

      if (isMobile) {
        if (hashIndex === null) {
          const randomIndex = Math.floor(Math.random() * galleryItems.length);
          updateHash(randomIndex);
          return;
        }

        setActiveIndex(hashIndex);
        return;
      }

      setActiveIndex(hashIndex);
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);

    return () => window.removeEventListener("hashchange", syncFromHash);
  }, [galleryItems.length, isLoaded, isMobile]);

  useEffect(() => {
    const current = activeIndex === null ? null : galleryItems[activeIndex];
    document.title = current ? `${SITE_TITLE} - ${decodeHtml(current.ttl)} -` : SITE_TITLE;
  }, [activeIndex, galleryItems]);

  const handleSelect = (index: number) => {
    updateHash(index);
  };

  const handleClose = () => {
    updateHash(null);
  };

  return (
    <>
      {!isLoaded ? (
        <div className="loader">
          <div className="loadingTxt fadeIn">
            <p className="lead">CONTENTS LOADING...</p>
            <p className="percent">{progress}%</p>
          </div>
        </div>
      ) : null}
      <main className={isLoaded ? "" : "displayNone"}>
        {isMobile ? (
          <MobileGallery
            items={galleryItems}
            activeIndex={activeIndex ?? 0}
            onSelect={handleSelect}
          />
        ) : (
          <DesktopGallery
            items={galleryItems}
            activeIndex={activeIndex}
            onSelect={handleSelect}
            onClose={handleClose}
          />
        )}
      </main>
    </>
  );
}
