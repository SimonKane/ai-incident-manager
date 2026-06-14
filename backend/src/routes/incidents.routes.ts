import { Router } from "express";
import {
  getAllIncidents,
  analyzeIncident,
  notifyAssignedStaff,
} from "../controllers/incidents.controller";

const router = Router();

router.get("/", getAllIncidents);
router.post("/analyze", analyzeIncident);
router.post("/:id/notify", notifyAssignedStaff);

export default router;
