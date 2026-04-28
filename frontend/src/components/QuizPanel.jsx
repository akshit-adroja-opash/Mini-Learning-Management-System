export function QuizPanel({ quiz }) {
  if (!quiz?.questions?.length) {
    return <p className="error-message">Quiz is not ready yet.</p>;
  }

  return (
    <section className="quiz-panel">
      <h2>{quiz.title}</h2>
      <p>Pass threshold: {quiz.passThreshold}%</p>
    </section>
  );
}
