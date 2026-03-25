"use client";

import { MathJaxContext } from "better-react-mathjax";
import { MATHJAX_CONFIG, MATHJAX_SRC } from "@/lib/mathjax-config";
import s from "@/styles/lesson-common.module.css";

interface LessonShellProps {
  children: React.ReactNode;
}

export default function LessonShell({ children }: LessonShellProps) {
  return (
    <MathJaxContext config={MATHJAX_CONFIG} src={MATHJAX_SRC}>
      <div className={s.lessonRoot}>
        <div className={`${s.ambientOrb} ${s.ambientOrbOne}`} />
        <div className={`${s.ambientOrb} ${s.ambientOrbTwo}`} />
        <div className={`${s.ambientOrb} ${s.ambientOrbThree}`} />
        <main className={s.page}>{children}</main>
      </div>
    </MathJaxContext>
  );
}
