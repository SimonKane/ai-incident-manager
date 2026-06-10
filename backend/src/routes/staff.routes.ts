import { Router } from "express";
import {
  createStaff,
  deleteStaff,
  getAllStaff,
  testSlackNotification,
  updateStaff,
} from "../controllers/staff.controller";

const router = Router();

router.get("/", getAllStaff);
router.post("/", createStaff);
router.post("/test-slack", testSlackNotification);
router.patch("/:id", updateStaff);
router.delete("/:id", deleteStaff);

export default router;
