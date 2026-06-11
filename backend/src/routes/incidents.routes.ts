import { Router } from "express";
import {
  getAllIncidents,
  analyzeIncident,
} from "../controllers/incidents.controller";

const router = Router();

router.get("/", getAllIncidents);
router.post("/analyze", analyzeIncident);

export default router;
