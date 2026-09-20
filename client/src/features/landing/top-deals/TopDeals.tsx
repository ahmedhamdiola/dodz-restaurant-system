import ProductCard from "../../products/product-card/ProductCard"
import TopDealImage from "../../../assets/mock-pics/top-deal.png"
import HeaderSection from "../../../components/ui/HeaderSection"

export const TopDeals = () => {
  return (
    <div className="mt-15 flex flex-col gap-6">
      <HeaderSection title="Top Deals" path="/OFFERS_ID" />
      <div className="lg:ml-14 grid grid-cols-1 gap-3 lg:gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 mx-auto">
        <ProductCard id={1001} name="Mix & Match" description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eu congue ultrices, eros mi rutrum libero, in vulputate velit nunc quis orci. Donec euismod tincidunt tempor. Maecenas ac hendrerit purus. Nullam quis massa sit amet neque posuere tincidunt." image={TopDealImage} price={100} />
        <ProductCard id={1002} name="Mix & Match" description="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, nisl eu congue ultrices, eros mi rutrum libero, in vulputate velit nunc quis orci. Donec euismod tincidunt tempor. Maecenas ac hendrerit purus. Nullam quis massa sit amet neque posuere tincidunt." image={TopDealImage} price={10} discount={10} />
      </div>
    </div>
  )
}
