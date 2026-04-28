import { DiscussionThread } from "../components/DiscussionThread.jsx";
import { QuizPanel } from "../components/QuizPanel.jsx";
import { VideoProgressPlayer } from "../components/VideoProgressPlayer.jsx";

const demoLesson = {
  id: "lesson-demo",
  videoUrl: "",
  lastPositionSeconds: 0,
};

export function LearningPage() {
  return (
    <section className="learning-grid">
      <VideoProgressPlayer lesson={demoLesson} />
      <QuizPanel quiz={{ title: "Module Quiz", passThreshold: 70, questions: [] }} />
      <DiscussionThread />
    </section>
  );
}
