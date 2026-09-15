import ProductCard from "../../products/product-card/ProductCard"
import TopDealImage from "../../../assets/mock-pics/top-deal.png"

export const TopDeals = () => {
  return (
    <div className="mt-15 flex flex-col gap-6">
      <h1 className="font-bold text-nowrap text-2xl uppercase tracking-tighter text-secondary lg:ml-14 border-b-2 pb-1 border-red-600 w-fit">Top Deals</h1>
      <div className="lg:ml-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        <ProductCard name="Mix & Match" description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eu congue ultrices, eros mi rutrum libero, in vulputate velit nunc quis orci. Donec euismod tincidunt tempor. Maecenas ac hendrerit purus. Nullam quis massa sit amet neque posuere tincidunt." image={TopDealImage} price={100} />
        <ProductCard name="Mix & Match" description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eu congue ultrices, eros mi rutrum libero, in vulputate velit nunc quis orci. Donec euismod tincidunt tempor. Maecenas ac hendrerit purus. Nullam quis massa sit amet neque posuere tincidunt." image={TopDealImage} price={10} discount={10} />
      </div>
    </div>
  )
}
