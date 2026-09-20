import { memo } from "react";
import type { MenuProduct } from "../types";
import ProductCard from "../../products/product-card/ProductCard";

interface ProductGridProps {
    products: MenuProduct[];
}

const ProductGrid = ({ products }: ProductGridProps) => {
    return (
        <div className="grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4 2xl:grid-cols-5">
            {products.map((product) => (
                <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    description={product.description}
                    image={product.image}
                    price={product.price}
                />
            ))}
        </div>
    );
};

export default memo(ProductGrid);