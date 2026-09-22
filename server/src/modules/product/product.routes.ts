import { Router } from 'express';
import { ProductController } from './product.controller.js';

const router = Router();
const controller = ProductController();

router.get('/', controller.getAllProducts); // get all products {all}
router.get('/category/:id', controller.getProductsByCategoryID); // get products by category id {all}
router.get('/top-deals', controller.getTopDealsProducts); // get top deals products {all}
router.get('/:id', controller.getProductByID); // get product by id {all}

router.post('/', controller.createProduct); // create product {admin}
router.put('/:id', controller.updateProduct); // edit product {admin}
router.delete('/:id', controller.deleteProduct); // delete product {admin}

export default router;