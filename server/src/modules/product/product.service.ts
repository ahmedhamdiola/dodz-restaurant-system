import { ProductRepository } from "./product.repository.js";
import { ProductInterfaceWithoutID } from "./product.types.js";

export const ProductService = () => {
    const repository = ProductRepository();
    const getProductsByCategoryID = (id: number) => {
        return repository.getProductsByCategoryID(id);
    }

    const getProductByID = (id: number) => {
        return repository.getProductByID(id);
    }

    const getTopDealsProducts = () => {
        return repository.getTopDealsProducts();
    }

    const createProduct = (product: ProductInterfaceWithoutID) => {
        return repository.createProduct(product);
    }

    const updateProduct = (id: number, product: ProductInterfaceWithoutID) => {
        return repository.updateProduct(id, product);
    }

    const deleteProduct = (id: number) => {
        return repository.deleteProduct(id);
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