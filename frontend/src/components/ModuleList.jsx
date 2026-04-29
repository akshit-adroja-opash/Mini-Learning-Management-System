export function ModuleList({ modules = [] }) {
  return (
    <div className="module-list">
      {modules.map((module) => (
        <article 
          className={`module-row ${module.isLocked ? "locked" : ""}`} 
          key={module._id}
        >
          <div className="module-order">
            {module.isLocked ? "🔒" : module.order}
          </div>
          <div className="module-info">
            <h3>{module.title}</h3>
            {module.isLocked && <p className="lock-message">Pass previous quiz to unlock</p>}
            <ul className="lesson-mini-list">
              {module.lessons?.map(lesson => (
                <li key={lesson._id}>
                  {lesson.title} {lesson.progress?.isCompleted ? "✅" : ""}
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  );
}
