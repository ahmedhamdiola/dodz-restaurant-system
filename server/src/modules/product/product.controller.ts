
import type { Request, Response } from 'express';
import { ProductService } from './product.service.js';
import { ProductInterfaceWithoutID } from './product.types.js';
import { BadRequestStatus, CheckId, ConflictStatus, CreateStatus, DeletedStatus, NotFoundStatus, SuccessStatus } from '../../utils/response.js';
import { resolveImageOrRespond } from '../../utils/image.js';
import type { AuthRequest } from '../auth/auth.middleware.js';

const service = ProductService();

/**
 * `includeUnavailable=true` is an admin affordance (the admin Studio needs sold-out
 * and modifier rows). These endpoints stay public for the storefront, so an
 * anonymous/untrusted caller asking for the extra rows is silently downgraded
 * instead of leaking hidden products.
 */
const wantsUnavailable = (req: Request): boolean =>
    req.query.includeUnavailable === "true" && (req as AuthRequest).user?.role === "admin";

export const ProductController = () => {
    const getProductsByCategoryID = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!CheckId(id)) {
            return BadRequestStatus(res, "Invalid category id");
        }
        const includeUnavailable = wantsUnavailable(req);
        const products = await service.getProductsByCategoryID(id, includeUnavailable);
        if (products === null) {
            return NotFoundStatus(res, 'Products not found');
        }
        return SuccessStatus(res, products);
    }

    const getAllProducts = async (req: Request, res: Response) => {
        const includeUnavailable = wantsUnavailable(req);
        const products = await service.getAllProducts(includeUnavailable);
        if (products === null) {
            return NotFoundStatus(res, 'Products not found');
        }
        return SuccessStatus(res, products);
    }

    const getProductByID = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!CheckId(id)) {
            return BadRequestStatus(res, "Invalid product id");
        }
        // Public detail: sold-out and modifier products must not be reachable.
        const product = await service.getProductByID(id, true);
        if (product === null) {
            return NotFoundStatus(res, 'Product not found');
        }
        return SuccessStatus(res, product);
    }


    const getTopDealsProducts = async (req: Request, res: Response) => {
        const products = await service.getTopDealsProducts();
        if (products === null) {
            return NotFoundStatus(res, 'Top Deals Products not found');
        }
        return SuccessStatus(res, products);
    }


    const createProduct = async (req: Request, res: Response) => {
        const image = await resolveImageOrRespond(req.body.image, res, "product image");
        if (image === null) {
            return;
        }

        const product: ProductInterfaceWithoutID = {
            name: req.body.name,
            description: req.body.description,
            price: Number(req.body.price),
            image,
            categoryID: Number(req.body.categoryID),
            isAvailable: req.body.isAvailable ?? true,
            isCustomizable: req.body.isCustomizable ?? false,
            isDeleted: false,
        };
        if (!CheckId(product.categoryID)) {
            return BadRequestStatus(res, "Invalid category id");
        }
        if (!product.name || !product.description || (product.price < 0 || isNaN(product.price)) || !product.image) {
            return BadRequestStatus(res, 'Invalid product data');
        }
        const result = await service.createProduct(product);
        if (result === null) {
            return ConflictStatus(res, 'Product already exists');
        }
        return CreateStatus(res, result);
    }

    const updateProduct = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!CheckId(id)) {
            return BadRequestStatus(res, "Invalid product id");
        }

        const existingProduct = await service.getProductByID(id);
        if (existingProduct === null) {
            return NotFoundStatus(res, 'Product not found');
        }

        const image = await resolveImageOrRespond(req.body.image ?? existingProduct.image, res, "product image");
        if (image === null) {
            return;
        }

        const product: ProductInterfaceWithoutID = {
            name: req.body.name ?? existingProduct.name,
            description: req.body.description ?? existingProduct.description,
            price: req.body.price !== undefined ? Number(req.body.price) : existingProduct.price,
            image,
            categoryID: req.body.categoryID !== undefined ? Number(req.body.categoryID) : existingProduct.category_id,
            isAvailable: req.body.isAvailable ?? true,
            isCustomizable: req.body.isCustomizable ?? false,
            isDeleted: false,
        };

        if (!CheckId(product.categoryID)) {
            return BadRequestStatus(res, "Invalid category id");
        }
        if (!product.name || !product.description || (product.price < 0 || isNaN(product.price)) || !product.image) {
            return BadRequestStatus(res, 'Invalid product data');
        }
        const result = await service.updateProduct(id, product);
        if (result === null) {
            return NotFoundStatus(res, 'Product not found');
        }
        return SuccessStatus(res, result);

    }

    const deleteProduct = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!CheckId(id)) {
            return BadRequestStatus(res, "Invalid product id");
        }
        const result = await service.deleteProduct(id);
        if (result === null) {
            return NotFoundStatus(res, 'Product not found');
        }
        return DeletedStatus(res, 'Product deleted');
    }

    // ---------------------------------------------------------- option tree

    /**
     * Public: the storefront customizer calls this. The admin builder passes
     * includeUnavailable=true so sold-out groups/values stay editable.
     */
    const getProductOptions = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!CheckId(id)) {
            return BadRequestStatus(res, "Invalid product id");
        }
        const includeUnavailable = wantsUnavailable(req);
        const options = await service.getProductOptions(id, includeUnavailable);
        if (options === null) {
            return NotFoundStatus(res, 'Product not found');
        }
        return SuccessStatus(res, { options });
    }

    /** Admin: FULL replace of the product's option tree, one atomic transaction. */
    const replaceProductOptions = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!CheckId(id)) {
            return BadRequestStatus(res, "Invalid product id");
        }
        // A full replace is destructive, so the payload must be explicit: a missing
        // or non-array `options` is a client bug, never "delete every option".
        if (typeof req.body !== "object" || req.body === null || Array.isArray(req.body)) {
            return BadRequestStatus(res, "Request body must be an object with an options array");
        }
        if (!Array.isArray(req.body.options)) {
            return BadRequestStatus(res, "options must be an array");
        }
        const result = await service.replaceProductOptions(id, { options: req.body.options });
        if (!result.ok) {
            if (result.code === "NOT_FOUND") {
                return NotFoundStatus(res, result.message);
            }
            return BadRequestStatus(res, result.message);
        }
        return SuccessStatus(res, { options: result.options });
    }

    const deleteProductOption = async (req: Request, res: Response) => {
        const productID = Number(req.params.id);
        const optionID = Number(req.params.optionId);
        if (!CheckId(productID)) {
            return BadRequestStatus(res, "Invalid product id");
        }
        if (!CheckId(optionID)) {
            return BadRequestStatus(res, "Invalid option id");
        }
        const result = await service.deleteProductOption(productID, optionID);
        if (!result.ok) {
            if (result.code === "NOT_FOUND") {
                return NotFoundStatus(res, result.message);
            }
            return BadRequestStatus(res, result.message);
        }
        return DeletedStatus(res, 'Option group deleted');
    }

    /** Admin: quick "sold out" / price tweak on a single value. */
    const patchProductOptionValue = async (req: Request, res: Response) => {
        const valueID = Number(req.params.valueId);
        if (!CheckId(valueID)) {
            return BadRequestStatus(res, "Invalid option value id");
        }
        const result = await service.patchProductOptionValue(valueID, req.body ?? {});
        if ("error" in result) {
            return BadRequestStatus(res, result.error);
        }
        return SuccessStatus(res, result);
    }

    /** Admin: modifier products for the option-value picker. */
    const getModifierProducts = async (req: Request, res: Response) => {
        const modifiers = await service.getModifierProducts();
        return SuccessStatus(res, modifiers);
    }

    return {
        getProductsByCategoryID,
        getAllProducts,
        getProductByID,
        getTopDealsProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        getProductOptions,
        replaceProductOptions,
        deleteProductOption,
        patchProductOptionValue,
        getModifierProducts,
    };
};
