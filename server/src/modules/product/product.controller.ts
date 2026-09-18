
import type { Request, Response } from 'express';
import { ProductService } from './product.service.js';
import { ProductInterfaceWithoutID } from './product.types.js';

const service = ProductService();

export const ProductController = () => {
    const getProductsByCategoryID = (req: Request, res: Response) => {
        return service.getProductsByCategoryID(Number(req.params.id));
    }

    const getProductByID = (req: Request, res: Response) => {
        return service.getProductByID(Number(req.params.id));
    }

    const getTopDealsProducts = (req: Request, res: Response) => {
        return service.getTopDealsProducts();
    }

    const createProduct = (req: Request, res: Response) => {
        const product: ProductInterfaceWithoutID = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            image: req.body.image,
            categoryID: Number(req.body.categoryID),
            isAvailable: req.body.isAvailable ?? true,
            isCustomizable: req.body.isCustomizable ?? false,
            isDeleted: false,
        };
        return service.createProduct(product);
    }

    const updateProduct = (req: Request, res: Response) => {
        const product: ProductInterfaceWithoutID = {
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            image: req.body.image,
            categoryID: Number(req.body.categoryID),
            isAvailable: req.body.isAvailable ?? true,
            isCustomizable: req.body.isCustomizable ?? false,
            isDeleted: false,
        };
        return service.updateProduct(Number(req.params.id), product);
    }

    const deleteProduct = (req: Request, res: Response) => {
        return service.deleteProduct(Number(req.params.id));
    }

    return {
        getProductsByCategoryID,
        getProductByID,
        getTopDealsProducts,
        createProduct,
        updateProduct,
        deleteProduct,
    };
};