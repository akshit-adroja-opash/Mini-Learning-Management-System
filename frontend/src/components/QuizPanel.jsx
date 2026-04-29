import { useState } from "react";
import { submitQuiz } from "../api/quizApi.js";
import toast from "react-hot-toast";

export function QuizPanel({ quiz, onComplete }) {
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleOptionSelect = (questionId, optionId) => {
    setAnswers({ ...answers, [questionId]: optionId });
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await submitQuiz(quiz._id, answers);
      setScore(res.data.percentage);
      if (onComplete) onComplete(res.data.passed, res.data.percentage);
    } catch (err) {
      toast.error("Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (score !== null) {
    const passed = score >= quiz.passThreshold;
    return (
      <div className={`quiz-result ${passed ? "pass" : "fail"}`}>
        <h3>{passed ? "🎉 Quiz Passed!" : "❌ Quiz Failed"}</h3>
        <p className="score-text">Your Score: <strong>{score.toFixed(1)}%</strong></p>
        <p>Pass Threshold: {quiz.passThreshold}%</p>
        {!passed && <button className="retry-btn" onClick={() => setScore(null)}>Try Again</button>}
      </div>
    );
  }

  if (!quiz?.questions?.length) {
    return <p className="error-message">Quiz is not ready yet.</p>;
  }

  return (
    <section className="quiz-panel">
      <h2>{quiz.title}</h2>
      <p className="quiz-meta">Answer all questions to pass. Pass threshold: {quiz.passThreshold}%</p>

      <div className="questions-container">
        {quiz.questions.map((question, index) => (
          <div key={question._id} className="question-item">
            <p className="question-prompt">
              <strong>Q{index + 1}:</strong> {question.prompt}
            </p>
            <div className="options-grid">
              {question.options.map((option) => (
                <label 
                  key={option._id} 
                  className={`option-label ${answers[question._id] === option._id ? "selected" : ""}`}
                >
                  <input
                    type="radio"
                    name={question._id}
                    value={option._id}
                    checked={answers[question._id] === option._id}
                    onChange={() => handleOptionSelect(question._id, option._id)}
                  />
                  {option.text}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button 
        className="submit-quiz-btn" 
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? "Submitting..." : "Submit Quiz"}
      </button>
    </section>
  );
}
