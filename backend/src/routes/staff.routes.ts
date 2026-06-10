import { Router } from "express";
import {
  createStaff,
  deleteStaff,
  getAllStaff,
  updateStaff,
} from "../controllers/staff.controller";

const router = Router();

router.get("/", getAllStaff);
router.post("/", createStaff);
router.patch("/:id", updateStaff);
router.delete("/:id", deleteStaff);

export default router;
