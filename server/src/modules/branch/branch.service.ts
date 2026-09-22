import { BranchRepository } from "./branch.repository.js";

export const BranchService = () => {
    const repository = BranchRepository();

    const getAllBranches = async () => {
        return repository.getAllBranches();
    };

    const getBranchByID = async (id: number) => {
        if (!id || id <= 0) {
            return null;
        }
        return repository.getBranchByID(id);
    };

    return {
        getAllBranches,
        getBranchByID,
    };
};