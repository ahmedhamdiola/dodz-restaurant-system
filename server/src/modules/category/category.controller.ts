import type { Request, Response } from 'express';
import { CategoryService } from './category.service.js';
import { BadRequestStatus, NotFoundStatus, SuccessStatus } from '../../utils/response.js';

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

    return {
        getAllCategories,
        getCategoryByID,
        getCategoryBySlug,
    };
};