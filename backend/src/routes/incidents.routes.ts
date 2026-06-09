import { Router } from "express";
import { getAllIncidents } from "../controllers/incidents.controller";

const router = Router();

router.get("/", getAllIncidents);

export default router;
