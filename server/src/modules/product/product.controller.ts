
import type { Request, Response } from 'express';
import { ProductService } from './product.service.js';
import { ProductInterfaceWithoutID } from './product.types.js';
import { BadRequestStatus, CheckId, ConflictStatus, CreateStatus, DeletedStatus, NotFoundStatus, SuccessStatus } from '../../utils/response.js';
import { resolveImageOrRespond } from '../../utils/image.js';

const service = ProductService();

export const ProductController = () => {
    const getProductsByCategoryID = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (!CheckId(id)) {
            return BadRequestStatus(res, "Invalid category id");
        }
        const products = await service.getProductsByCategoryID(id);
        if (products === null) {
            return NotFoundStatus(res, 'Products not found');
        }
        return SuccessStatus(res, products);
    }

    const getAllProducts = async (req: Request, res: Response) => {
        const includeUnavailable = req.query.includeUnavailable === "true";
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
        const product = await service.getProductByID(id);
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

    return {
        getProductsByCategoryID,
        getAllProducts,
        getProductByID,
        getTopDealsProducts,
        createProduct,
        updateProduct,
        deleteProduct,
    };
};