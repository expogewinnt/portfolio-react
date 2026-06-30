"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  decodeHtml,
  formatChargeForMobile,
  getDefaultImageSrc,
  getGalleryItemKey,
  parseHash,
  preloadImages,
  updateHash,
  type GalleryImageSize,
  type GalleryViewItem
} from "@/lib/gallery-view-utils";

const MOBILE_BREAKPOINT = 768;
const SCROLL_SPACE = 120;
const SCROLL_FRICTION = 100;

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

type GalleryViewProps = {
  items: GalleryViewItem[];
  siteTitle: ReactNode;
  copyrightText: string;
  documentTitle: string;
  getImageSrc?: (item: GalleryViewItem, size: GalleryImageSize) => string;
};

function DesktopGallery({
  items,
  activeIndex,
  onSelect,
  onClose,
  siteTitle,
  copyrightText,
  getImageSrc
}: {
  items: GalleryViewItem[];
  activeIndex: number | null;
  onSelect: (index: number) => void;
  onClose: () => void;
  siteTitle: ReactNode;
  copyrightText: string;
  getImageSrc: (item: GalleryViewItem, size: GalleryImageSize) => string;
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
                  key={getGalleryItemKey(item, index)}
                  className={`imgObjContainer big ${isActive ? "fadeIn displayBlock" : ""}`}
                >
                  <div className="ttl">{decodeHtml(item.ttl)}</div>
                  <div className="imgContainer">
                    <img
                      src={getImageSrc(item, "big")}
                      alt={decodeHtml(item.ttl)}
                    />
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
          <h1 className="siteTitle">{siteTitle}</h1>
        </header>
        <div className="content" ref={contentRef}>
          <div className="smallsContainer">
            <ul className="smalls" ref={smallsRef} data-left="0">
              {items.map((item, index) => (
                <li key={getGalleryItemKey(item, index)} className="imgObjContainer">
                  <button
                    type="button"
                    className="imgContainer small smallFadeIn imgHover buttonReset"
                    style={{ animationDelay: `${0.05 * index}s` }}
                    onClick={() => onSelect(index)}
                    aria-label={decodeHtml(item.ttl)}
                  >
                    <img
                      src={getImageSrc(item, "small")}
                      alt={decodeHtml(item.ttl)}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <footer>
          <p>{copyrightText}</p>
        </footer>
      </div>
    </>
  );
}

function MobileGallery({
  items,
  activeIndex,
  onSelect,
  siteTitle,
  copyrightText,
  getImageSrc
}: {
  items: GalleryViewItem[];
  activeIndex: number;
  onSelect: (index: number) => void;
  siteTitle: ReactNode;
  copyrightText: string;
  getImageSrc: (item: GalleryViewItem, size: GalleryImageSize) => string;
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
        <h1 className="siteTitle">{siteTitle}</h1>
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
              <li
                key={getGalleryItemKey(item, index)}
                className={`imgObjContainer sp swiper-slide ${index === activeIndex ? "fadeIn" : ""}`}
              >
                <div className="imgContainer">
                  <img src={getImageSrc(item, "sp")} alt={decodeHtml(item.ttl)} />
                </div>
                <div className="ttl">{decodeHtml(item.ttl)}</div>
                <div className="charge mobileCharge">{formatChargeForMobile(item.charge)}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <footer>
        <p>{copyrightText}</p>
      </footer>
    </div>
  );
}

export function GalleryView({
  items,
  siteTitle,
  copyrightText,
  documentTitle,
  getImageSrc = getDefaultImageSrc
}: GalleryViewProps) {
  const isMobile = useIsMobile();
  const [isLoaded, setIsLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const galleryItems = useMemo(() => items, [items]);

  useEffect(() => {
    const urls = galleryItems.flatMap((item) =>
      isMobile
        ? [getImageSrc(item, "sp")]
        : [getImageSrc(item, "small"), getImageSrc(item, "big")]
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
  }, [galleryItems, getImageSrc, isMobile]);

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
    document.title = current
      ? `${documentTitle} - ${decodeHtml(current.ttl)} -`
      : documentTitle;
  }, [activeIndex, documentTitle, galleryItems]);

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
            siteTitle={siteTitle}
            copyrightText={copyrightText}
            getImageSrc={getImageSrc}
          />
        ) : (
          <DesktopGallery
            items={galleryItems}
            activeIndex={activeIndex}
            onSelect={handleSelect}
            onClose={handleClose}
            siteTitle={siteTitle}
            copyrightText={copyrightText}
            getImageSrc={getImageSrc}
          />
        )}
      </main>
    </>
  );
}
