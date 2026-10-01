import ProductCard from "../../products/product-card/ProductCard";
import HeaderSection from "../../../components/ui/HeaderSection";
import { useTopDeals } from "../../menu/hooks/useMenu";

/**
 * Landing-page top deals. Sourced from `GET /products/top-deals` (highest
 * `sold_amount` among storefront-visible products) so the section always shows
 * real, orderable meals and honors each product's customizability.
 */
export const TopDeals = () => {
  const { data: deals, isLoading, isError, refetch } = useTopDeals();
  const products = deals ?? [];

  return (
    <div className="mt-15 flex flex-col gap-6">
      <HeaderSection title="Top Deals" path="/menu" />
      {isError ? (
        <div className="flex flex-col items-center gap-3 py-10 text-center lg:ml-14">
          <p className="text-sm text-muted-foreground">We couldn't load today's deals.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="cursor-pointer rounded-full border border-border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition-colors hover:bg-muted"
          >
            Try again
          </button>
        </div>
      ) : isLoading ? (
        <div
          role="status"
          aria-label="Loading top deals"
          className="mx-auto grid w-full grid-cols-1 gap-3 sm:grid-cols-3 lg:ml-14 lg:grid-cols-4 lg:gap-5 xl:grid-cols-4 2xl:grid-cols-5"
        >
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="h-64 w-full max-w-[250px] animate-pulse rounded-2xl border border-border bg-muted"
            />
          ))}
        </div>
      ) : products.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground lg:ml-14">
          No deals available right now.
        </p>
      ) : (
        <div className="lg:ml-14 grid grid-cols-1 gap-3 lg:gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 mx-auto">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              description={product.description}
              image={product.image}
              price={product.price}
              isCustomizable={product.isCustomizable}
            />
          ))}
        </div>
      )}
    </div>
  );
};
