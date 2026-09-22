import { CategoryRepository } from "./category.repository.js";
import { CategoryInput } from "./category.interface.js";

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

    const createCategory = async (category: CategoryInput) => {
        const existingCategory = await repository.getCategoryByName(category.name);
        if (existingCategory) {
            return null;
        }
        const existingSlug = await repository.getCategoryBySlug(category.slug);
        if (existingSlug) {
            return null;
        }

        return repository.createCategory(category);
    }

    const updateCategory = async (id: number, category: CategoryInput) => {
        const existingCategory = await repository.getCategoryByID(id);
        if (!existingCategory) {
            return null;
        }

        return repository.updateCategory(id, category);
    }

    const deleteCategory = async (id: number) => {
        const existingCategory = await repository.getCategoryByID(id);
        if (!existingCategory) {
            return null;
        }

        return repository.deleteCategory(id);
    }

    return {
        getAllCategories,
        getCategoryByID,
        getCategoryBySlug,
        createCategory,
        updateCategory,
        deleteCategory,
    };
};