import { getLessonMeta } from "@/lib/lessons";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Lesson10Page from "@/components/knowledge/lessons/Lesson10Page";

interface Props {
  params: Promise<{ lessonId: string }>;
}

const LESSON_COMPONENTS: Record<string, React.ComponentType> = {
  "10": Lesson10Page,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lessonId } = await params;
  const meta = getLessonMeta(lessonId);
  if (!meta) return {};
  return {
    title: `${meta.title} — Matoteka Znanje`,
    description: meta.description,
  };
}

export default async function LessonPage({ params }: Props) {
  const { lessonId } = await params;
  const meta = getLessonMeta(lessonId);
  if (!meta) notFound();

  const LessonComponent = LESSON_COMPONENTS[lessonId];
  if (!LessonComponent) {
    notFound();
  }

  return <LessonComponent />;
}
