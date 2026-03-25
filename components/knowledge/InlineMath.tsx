"use client";

import { MathJax } from "better-react-mathjax";

interface InlineMathProps {
  children: string;
  dynamic?: boolean;
}

export default function InlineMath({ children, dynamic }: InlineMathProps) {
  return (
    <MathJax
      inline
      dynamic={dynamic}
      style={{ display: "inline", verticalAlign: "baseline" }}
    >
      {`\\(${children}\\)`}
    </MathJax>
  );
}
