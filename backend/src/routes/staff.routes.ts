import { Router } from "express";
import { getAllStaff } from "../controllers/staff.controller";

const router = Router();

router.get("/", getAllStaff);

export default router;
