import { CategoryRepository } from "./category.repository.js";

export const CategoryService = () => {
    const repository = CategoryRepository();

    const getAllCategories = async () => {
        return repository.getAllCategories();
    }

    const getCategoryByID = async (id: number) => {
        if (!id || id <= 0) {
            return null;
        }
        return repository.getCategoryByID(id);
    }

    const getCategoryBySlug = async (slug: string) => {
        if (!slug) {
            return null;
        }
        return repository.getCategoryBySlug(slug);
    }

    return {
        getAllCategories,
        getCategoryByID,
        getCategoryBySlug,
    };
};