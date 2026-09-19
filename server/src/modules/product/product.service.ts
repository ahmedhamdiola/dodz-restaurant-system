import { ProductRepository } from "./product.repository.js";
import { ProductInterfaceWithoutID } from "./product.types.js";

export const ProductService = () => {
    const repository = ProductRepository();

    const getProductsByCategoryID = async (id: number) => {

        /*
        const category = await categoryRepository.getCategoryByID(id);
        if (!category) {
            return null;
        }
        */

        return repository.getProductsByCategoryID(id);
    }

    const getProductByID = async (id: number) => {
        if (!id || id <= 0) {
            return null;
        }

        return repository.getProductByID(id);
    }

    const getTopDealsProducts = async () => {
        return repository.getTopDealsProducts();
    }

    const createProduct = async (product: ProductInterfaceWithoutID) => {
        /*
        const category = await categoryRepository.getCategoryByID(product.categoryID);
        if (!category) {
            return null;
        }
        */

        const existingProduct = await repository.getProductByName(product.name);
        if (existingProduct) {
            return null;
        }

        return repository.createProduct(product);
    }

    const updateProduct = async (id: number, product: ProductInterfaceWithoutID) => {
        /*
        const category = await categoryRepository.getCategoryByID(product.categoryID);
        if (!category) {
            return null;
        }
        */

        const existingProduct = await repository.getProductByID(id);
        if (!existingProduct) {
            return null;
        }

        return repository.updateProduct(id, product);
    }

    const deleteProduct = async (id: number) => {
        const existingProduct = await repository.getProductByID(id);
        if (!existingProduct) {
            return null;
        }

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