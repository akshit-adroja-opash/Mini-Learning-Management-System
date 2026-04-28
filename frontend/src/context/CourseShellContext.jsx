import { createContext, useContext, useReducer } from "react";

const CourseShellContext = createContext(null);

const initialState = {
  activeModuleId: null,
  activeLessonId: null,
  moduleStatusById: {},
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_ACTIVE_LESSON":
      return {
        ...state,
        activeModuleId: action.moduleId,
        activeLessonId: action.lessonId,
      };
    case "SET_MODULE_STATUS":
      return {
        ...state,
        moduleStatusById: {
          ...state.moduleStatusById,
          [action.moduleId]: action.status,
        },
      };
    default:
      return state;
  }
}

export function CourseShellProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <CourseShellContext.Provider value={{ state, dispatch }}>
      {children}
    </CourseShellContext.Provider>
  );
}

export function useCourseShell() {
  return useContext(CourseShellContext);
}
