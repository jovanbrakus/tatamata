"use client";

import { useEffect, useRef, useState } from "react";

interface ProblemStatementProps {
  problemId: string;
  /** "statement" shows only the problem text, "full" shows everything */
  section?: "statement" | "full";
  minHeight?: string;
}

export default function ProblemStatement({
  problemId,
  section = "statement",
  minHeight = "150px",
}: ProblemStatementProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    // Read initial theme
    const stored = localStorage.getItem("theme") as string | null;
    setTheme(stored || "dark");

    // Watch for theme changes on the parent <html> element
    const observer = new MutationObserver(() => {
      const isLight = document.documentElement.classList.contains("light");
      const newTheme = isLight ? "light" : "dark";
      setTheme(newTheme);

      // Sync to iframe without reload
      try {
        const doc = iframeRef.current?.contentDocument;
        if (doc) {
          doc.documentElement.className = newTheme;
        }
      } catch {
        // cross-origin access denied — ignore
      }
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const src =
    section === "statement"
      ? `/api/problems/${problemId}/html?section=statement&theme=${theme}`
      : `/api/problems/${problemId}/html?theme=${theme}`;

  return (
    <iframe
      ref={iframeRef}
      src={src}
      sandbox="allow-scripts allow-same-origin"
      className="w-full border-none"
      title={section === "statement" ? "Postavka zadatka" : "Resenje"}
      style={{ minHeight }}
      onLoad={(e) => {
        const iframe = e.target as HTMLIFrameElement;
        try {
          const doc = iframe.contentDocument || iframe.contentWindow?.document;
          if (doc) {
            // Sync theme class on load in case it changed between URL construction and load
            const isLight = document.documentElement.classList.contains("light");
            doc.documentElement.className = isLight ? "light" : "dark";

            const updateHeight = () => {
              const bodyStyle = doc.defaultView?.getComputedStyle(doc.body);
              const marginTop = parseInt(bodyStyle?.marginTop || "0", 10);
              const marginBottom = parseInt(bodyStyle?.marginBottom || "0", 10);
              const height = doc.body.offsetHeight + marginTop + marginBottom + 1;
              iframe.style.height = height + "px";
            };
            const resizeObserver = new ResizeObserver(updateHeight);
            resizeObserver.observe(doc.body);
            updateHeight();
          }
        } catch {
          iframe.style.height = section === "statement" ? "400px" : "600px";
        }
      }}
    />
  );
}
