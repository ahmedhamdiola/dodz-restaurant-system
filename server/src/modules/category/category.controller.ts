import type { Request, Response } from 'express';
import { CategoryService } from './category.service.js';
import { CategoryInput } from './category.interface.js';
import { BadRequestStatus, CheckId, ConflictStatus, CreateStatus, DeletedStatus, NotFoundStatus, SuccessStatus } from '../../utils/response.js';
import { resolveImageOrRespond } from '../../utils/image.js';

const service = CategoryService();

export const CategoryController = () => {
    const getAllCategories = async (req: Request, res: Response) => {
        const categories = await service.getAllCategories();
        if (categories === null) {
            return NotFoundStatus(res, 'Categories not found');
        }
        return SuccessStatus(res, categories);
    }

    const getCategoryByID = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const category = await service.getCategoryByID(id);
        if (category === null) {
            return NotFoundStatus(res, 'Category not found');
        }
        return SuccessStatus(res, category);
    }

    const getCategoryBySlug = async (req: Request, res: Response) => {
        const category = await service.getCategoryBySlug(String(req.params.slug));
        if (category === null) {
            return NotFoundStatus(res, 'Category not found');
        }
        return SuccessStatus(res, category);
    }

    const createCategory = async (req: Request, res: Response) => {
        const coverImage = await resolveImageOrRespond(req.body.image, res, "category image");
        if (coverImage === null) {
            return;
        }

        const category: CategoryInput = {
            name: req.body.name,
            slug: req.body.slug,
            coverImage,
            iconImage: coverImage,
        };
        if (!category.name || !category.slug) {
            return BadRequestStatus(res, 'Invalid category data');
        }

        const result = await service.createCategory(category);
        if (result === null) {
            return ConflictStatus(res, 'Category already exists');
        }
        return CreateStatus(res, result);
    }

    const updateCategory = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!CheckId(id)) {
            return BadRequestStatus(res, "Invalid category id");
        }

        const existingCategory = await service.getCategoryByID(id);
        if (existingCategory === null) {
            return NotFoundStatus(res, 'Category not found');
        }

        const coverImage = await resolveImageOrRespond(req.body.image ?? existingCategory.cover_image, res, "category image");
        if (coverImage === null) {
            return;
        }

        const category: CategoryInput = {
            name: req.body.name ?? existingCategory.name,
            slug: req.body.slug ?? existingCategory.slug,
            coverImage,
            iconImage: coverImage,
        };
        if (!category.name || !category.slug) {
            return BadRequestStatus(res, 'Invalid category data');
        }

        const result = await service.updateCategory(id, category);
        if (result === null) {
            return NotFoundStatus(res, 'Category not found');
        }
        return SuccessStatus(res, result);
    }

    const deleteCategory = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!CheckId(id)) {
            return BadRequestStatus(res, "Invalid category id");
        }

        const result = await service.deleteCategory(id);
        if (result === null) {
            return NotFoundStatus(res, 'Category not found');
        }
        return DeletedStatus(res, 'Category deleted');
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