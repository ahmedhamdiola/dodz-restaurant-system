import type { Request, Response } from "express";
import { BranchService } from "./branch.service.js";
import { NotFoundStatus, SuccessStatus } from "../../utils/response.js";

const service = BranchService();

export const BranchController = () => {
    const getAllBranches = async (req: Request, res: Response) => {
        const branches = await service.getAllBranches();
        return SuccessStatus(res, branches);
    };

    const getBranchByID = async (req: Request, res: Response) => {
        const branch = await service.getBranchByID(Number(req.params.id));
        if (branch === null) {
            return NotFoundStatus(res, "Branch not found");
        }
        return SuccessStatus(res, branch);
    };

    return {
        getAllBranches,
        getBranchByID,
    };
};