import { Router } from 'express';
import { ProductController } from './product.controller.js';
import { optionalAuth, requireAuth, requireRole } from '../auth/auth.middleware.js';

const router = Router();
const controller = ProductController();

// ROUTE ORDER IS LOAD-BEARING.
// Express 5 (path-to-regexp v8) matches "/options/modifiers" and "/:id" in the
// same position, so the literal route must be registered first. (`:id` only
// matches ONE segment, so it could never swallow the two-segment literal - but
// registering first keeps the intent obvious and survives future refactors.)
router.get('/options/modifiers', requireAuth, requireRole('admin'), controller.getModifierProducts); // modifier products for the admin picker {admin}
// Public reads keep working without a token; optionalAuth only attaches the caller
// so the controller can honour `includeUnavailable=true` for admins. Storefront
// callers are never able to pull sold-out or modifier rows.
router.get('/', optionalAuth, controller.getAllProducts); // get all products {all}
router.get('/category/:id', optionalAuth, controller.getProductsByCategoryID); // get products by category id {all}
router.get('/top-deals', controller.getTopDealsProducts); // get top deals products {all}
router.get('/:id/options', optionalAuth, controller.getProductOptions); // option tree (public; admin passes includeUnavailable=true) {all}
router.get('/:id', controller.getProductByID); // get product by id {all}

router.post('/', requireAuth, requireRole('admin'), controller.createProduct); // create product {admin}
router.put('/:id', requireAuth, requireRole('admin'), controller.updateProduct); // edit product {admin}
router.delete('/:id', requireAuth, requireRole('admin'), controller.deleteProduct); // delete product {admin}

// Option tree management. `PUT /options/values/:valueId` is registered after
// `/:id/options` because the two never collide (different segment counts).
router.put('/:id/options', requireAuth, requireRole('admin'), controller.replaceProductOptions); // full replace of the option tree {admin}
router.put('/options/values/:valueId', requireAuth, requireRole('admin'), controller.patchProductOptionValue); // patch one value (sold out / price) {admin}
router.delete('/:id/options/:optionId', requireAuth, requireRole('admin'), controller.deleteProductOption); // delete one option group {admin}

export default router;
