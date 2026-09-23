import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { requireAuth, requireRole } from '../auth/auth.middleware.js';

const router = Router();
const controller = ProductController();

router.get('/', controller.getAllProducts); // get all products {all}
router.get('/category/:id', controller.getProductsByCategoryID); // get products by category id {all}
router.get('/top-deals', controller.getTopDealsProducts); // get top deals products {all}
router.get('/:id', controller.getProductByID); // get product by id {all}

router.post('/', requireAuth, requireRole('admin'), controller.createProduct); // create product {admin}
router.put('/:id', requireAuth, requireRole('admin'), controller.updateProduct); // edit product {admin}
router.delete('/:id', requireAuth, requireRole('admin'), controller.deleteProduct); // delete product {admin}

export default router;