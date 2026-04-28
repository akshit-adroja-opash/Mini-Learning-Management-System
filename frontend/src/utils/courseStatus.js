export const courseStatuses = {
  locked: "locked",
  available: "available",
  inProgress: "in-progress",
  completed: "completed",
};

export function isModuleUnlocked(moduleStatus) {
  return moduleStatus !== courseStatuses.locked;
}
