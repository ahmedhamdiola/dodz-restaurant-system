import { Router } from "express";
import { BranchController } from "./branch.controller.js";

const router = Router();
const controller = BranchController();

router.get("/", controller.getAllBranches); // get all branches {all}
router.get("/:id", controller.getBranchByID); // get branch by id {all}

export default router;