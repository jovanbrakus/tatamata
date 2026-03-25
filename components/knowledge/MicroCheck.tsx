"use client";

import s from "@/styles/lesson10.module.css";

interface MicroCheckProps {
  question: string;
  answer: React.ReactNode;
}

export default function MicroCheck({ question, answer }: MicroCheckProps) {
  return (
    <details className={s.microCheck}>
      <summary className={s.detailsSummary}>{question}</summary>
      <div className={s.detailsBody}>{answer}</div>
    </details>
  );
}
