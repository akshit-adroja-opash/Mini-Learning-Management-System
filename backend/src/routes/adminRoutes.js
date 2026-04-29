import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  getUsers,
  updateUserRole,
  deleteUser,
  getAdminCourses,
  deleteCourse,
  getAdminAnalytics,
} from "../controllers/adminController.js";

const router = express.Router();

router.get("/users", protect, authorize("admin"), getUsers);
router.put("/users/:id/role", protect, authorize("admin"), updateUserRole);
router.delete("/users/:id", protect, authorize("admin"), deleteUser);

router.get("/courses", protect, authorize("admin"), getAdminCourses);
router.delete("/courses/:id", protect, authorize("admin"), deleteCourse);

router.get("/analytics", protect, authorize("admin"), getAdminAnalytics);
export default router;