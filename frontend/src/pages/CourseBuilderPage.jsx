import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCourse } from "../api/courseApi";
import { getCourseModules, createModule, deleteModule } from "../api/moduleApi";
import { createLesson, deleteLesson, getModuleLessons } from "../api/lessonApi";
import { getModuleQuiz, createQuiz, addQuestion } from "../api/quizApi";
import toast from "react-hot-toast";
import "../styles/courseBuilder.css";

export function CourseBuilderPage() {
  const { courseId } = useParams();
  const queryClient = useQueryClient();
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState(null);

  const [moduleData, setModuleData] = useState({ title: "", order: 1 });
  const [lessonData, setLessonData] = useState({ 
    title: "", 
    videoUrl: "", 
    durationSeconds: 1, 
    order: 0 
  });

  const { data: course } = useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourse(courseId).then(res => res.data)
  });

  const { data: modules, isLoading } = useQuery({
    queryKey: ["modules", courseId],
    queryFn: () => getCourseModules(courseId).then(res => res.data)
  });

  const addModuleMutation = useMutation({
    mutationFn: (data) => createModule({ ...data, course: courseId }),
    onSuccess: () => {
      queryClient.invalidateQueries(["modules", courseId]);
      setShowModuleModal(false);
      setModuleData({ title: "", order: modules?.length + 1 || 1 });
      toast.success("Module added");
    }
  });

  const addLessonMutation = useMutation({
    mutationFn: (data) => createLesson({ ...data, course: courseId, module: activeModuleId }),
    onSuccess: () => {
      queryClient.invalidateQueries(["lessons", activeModuleId]);
      setShowLessonModal(false);
      toast.success("Lesson added");
    }
  });

  if (isLoading) return <p>Loading Builder...</p>;

  return (
    <div className="course-builder-page">
      <div className="builder-header">
        <h1>Course Builder: {course?.title}</h1>
        <button className="add-btn" onClick={() => setShowModuleModal(true)}>
          Add Module
        </button>
      </div>

      <div className="modules-list">
        {modules?.map((module) => (
          <div key={module._id} className="module-card">
            <div className="module-header">
              <span className="module-title">Module {module.order}: {module.title}</span>
              <div className="module-actions">
                <button 
                  className="add-btn secondary"
                  onClick={() => {
                    setActiveModuleId(module._id);
                    setShowLessonModal(true);
                  }}
                >
                  + Add Lesson
                </button>
                <button 
                  className="add-btn secondary"
                  onClick={() => {
                    setActiveModuleId(module._id);
                    setShowQuizModal(true);
                  }}
                >
                  Manage Quiz
                </button>
              </div>
            </div>
            <LessonList moduleId={module._id} />
          </div>
        ))}
      </div>

      {/* Module Modal */}
      {showModuleModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Module</h2>
            <div className="form-group">
              <label>Module Title</label>
              <input 
                type="text" 
                value={moduleData.title} 
                onChange={(e) => setModuleData({ ...moduleData, title: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowModuleModal(false)}>Cancel</button>
              <button className="add-btn" onClick={() => addModuleMutation.mutate(moduleData)}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lesson Modal */}
      {showLessonModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Add Lesson</h2>
            <div className="form-group">
              <label>Lesson Title</label>
              <input 
                type="text" 
                value={lessonData.title} 
                onChange={(e) => setLessonData({ ...lessonData, title: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Video URL</label>
              <input 
                type="text" 
                value={lessonData.videoUrl} 
                onChange={(e) => setLessonData({ ...lessonData, videoUrl: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Duration (Seconds)</label>
              <input 
                type="number" 
                value={lessonData.durationSeconds} 
                onChange={(e) => setLessonData({ ...lessonData, durationSeconds: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowLessonModal(false)}>Cancel</button>
              <button className="add-btn" onClick={() => addLessonMutation.mutate(lessonData)}>
                Add Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
        <QuizBuilderModal 
          moduleId={activeModuleId} 
          courseId={courseId}
          onClose={() => setShowQuizModal(false)} 
        />
      )}
    </div>
  );
}

function QuizBuilderModal({ moduleId, courseId, onClose }) {
  const queryClient = useQueryClient();
  const [questionData, setQuestionData] = useState({ 
    prompt: "", 
    options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }],
    order: 1
  });

  const { data: quiz, isLoading } = useQuery({
    queryKey: ["quiz", moduleId],
    queryFn: () => getModuleQuiz(moduleId).then(res => res.data)
  });

  const createQuizMutation = useMutation({
    mutationFn: () => createQuiz({ course: courseId, module: moduleId, title: "Module Quiz" }),
    onSuccess: () => queryClient.invalidateQueries(["quiz", moduleId])
  });

  const addQuestionMutation = useMutation({
    mutationFn: (data) => addQuestion(quiz._id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["quiz", moduleId]);
      toast.success("Question added");
    }
  });

  if (isLoading) return <p>Loading Quiz...</p>;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Module Quiz</h2>
        {!quiz ? (
          <button className="add-btn" onClick={() => createQuizMutation.mutate()}>
            Initialize Quiz for this Module
          </button>
        ) : (
          <div className="quiz-details">
            <p>Questions: {quiz.questions?.length || 0}</p>
            <div className="add-question-form">
              <h3>Add Question</h3>
              <input 
                placeholder="Question Prompt" 
                className="prompt-input"
                value={questionData.prompt}
                onChange={e => setQuestionData({...questionData, prompt: e.target.value})}
              />
              
              <div className="options-setup">
                <h4>Options</h4>
                {questionData.options.map((opt, idx) => (
                  <div key={idx} className="option-row">
                    <input 
                      type="radio" 
                      name="correct-opt" 
                      checked={opt.isCorrect}
                      onChange={() => {
                        const newOpts = questionData.options.map((o, i) => ({ ...o, isCorrect: i === idx }));
                        setQuestionData({ ...questionData, options: newOpts });
                      }}
                    />
                    <input 
                      placeholder={`Option ${idx + 1}`} 
                      value={opt.text}
                      onChange={e => {
                        const newOpts = [...questionData.options];
                        newOpts[idx].text = e.target.value;
                        setQuestionData({ ...questionData, options: newOpts });
                      }}
                    />
                  </div>
                ))}
              </div>

              <button className="add-btn" onClick={() => {
                if (!questionData.prompt || questionData.options.some(o => !o.text)) {
                  return toast.error("Please fill all fields");
                }
                addQuestionMutation.mutate(questionData);
                setQuestionData({ 
                  prompt: "", 
                  options: [{ text: "", isCorrect: true }, { text: "", isCorrect: false }],
                  order: 0
                });
              }}>
                Save Question
              </button>
            </div>
          </div>
        )}
        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function LessonList({ moduleId }) {
  const { data: lessons } = useQuery({
    queryKey: ["lessons", moduleId],
    queryFn: () => getModuleLessons(moduleId).then(res => res.data)
  });

  return (
    <div className="lessons-list">
      {lessons?.map(lesson => (
        <div key={lesson._id} className="lesson-item">
          <div className="lesson-info">
            <h4>{lesson.title}</h4>
            <span>Video: {lesson.videoUrl}</span>
          </div>
        </div>
      ))}
      {lessons?.length === 0 && <p className="empty-msg">No lessons in this module yet.</p>}
    </div>
  );
}
