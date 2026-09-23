import { Router } from 'express';
import { CategoryController } from './category.controller.js';
import { requireAuth, requireRole } from '../auth/auth.middleware.js';

const router = Router();
const controller = CategoryController();

router.get('/', controller.getAllCategories); // get all categories {all}
router.get('/slug/:slug', controller.getCategoryBySlug); // get category by slug {all}
router.get('/:id', controller.getCategoryByID); // get category by id {all}

router.post('/', requireAuth, requireRole('admin'), controller.createCategory); // create category {admin}
router.put('/:id', requireAuth, requireRole('admin'), controller.updateCategory); // edit category {admin}
router.delete('/:id', requireAuth, requireRole('admin'), controller.deleteCategory); // delete category {admin}

export default router;