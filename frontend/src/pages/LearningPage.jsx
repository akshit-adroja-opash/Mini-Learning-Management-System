import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCourse } from "../api/courseApi";
import { DiscussionThread } from "../components/DiscussionThread.jsx";
import { QuizPanel } from "../components/QuizPanel.jsx";
import { VideoProgressPlayer } from "../components/VideoProgressPlayer.jsx";
import { useState, useEffect } from "react";
import "../styles/learningPage.css";

export function LearningPage() {
  const { courseId } = useParams();
  const [activeLesson, setActiveLesson] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId).then(res => res.data)
  });

  useEffect(() => {
    if (course && course.modules?.length > 0) {
      // Find the first available (not locked) module
      const availableModule = course.modules.find(m => !m.isLocked) || course.modules[0];
      
      if (availableModule.lessons?.length > 0) {
        setActiveLesson(availableModule.lessons[0]);
      }
      
      if (availableModule.quiz) {
        setActiveQuiz(availableModule.quiz);
      }
    }
  }, [course]);

  if (isLoading) return <div className="loading">Loading Course...</div>;

  return (
    <section className="learning-grid">
      <div className="learning-main">
        {activeLesson ? (
          <VideoProgressPlayer lesson={activeLesson} />
        ) : (
          <div className="alert-box">No lesson selected or available.</div>
        )}
        
        {activeQuiz && (
          <QuizPanel quiz={activeQuiz} />
        )}
        
        <DiscussionThread />
      </div>

      <div className="learning-sidebar">
        <h3>Course Content</h3>
        {course?.modules?.map(module => (
          <div key={module._id} className={`module-section ${module.isLocked ? "locked" : ""}`}>
            <h4>{module.isLocked ? "🔒" : ""} {module.title}</h4>
            <ul>
              {module.lessons?.map(lesson => (
                <li 
                  key={lesson._id} 
                  className={activeLesson?._id === lesson._id ? "active" : ""}
                  onClick={() => !module.isLocked && setActiveLesson(lesson)}
                >
                  {lesson.title}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
