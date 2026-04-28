export function ModuleList({ modules = [] }) {
  return (
    <div className="module-list">
      {modules.map((module) => (
        <article className={`module-row module-row--${module.status}`} key={module.id}>
          <span>{module.order}</span>
          <div>
            <h3>{module.title}</h3>
            <p>{module.status}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
