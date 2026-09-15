import { HeartIcon as HeartIconDisabled } from '@heroicons/react/24/outline'
import Separator from '../../../components/ui/Separator'

interface ProductCardProps {
    name: string,
    description: string,
    image: string,
    price: number,
    discount?: number,
}

const ProductCard = ({ name, description, image, price, discount }: ProductCardProps) => {
    return (
        <div className="w-full rounded-2xl border border-border bg-card p-3 shadow-sm transition-shadow hover:shadow-md cursor-pointer">
            <div className="flex h-full w-full flex-col gap-2">
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-muted">
                    <img src={image} alt={name} className="h-full w-full object-cover" />
                </div>
                <div className="flex items-center justify-between gap-2">
                    <h2 className="truncate text-lg font-bold text-secondary sm:text-xl">{name}</h2>
                    <button className="h-8 w-8 shrink-0 cursor-pointer rounded-full bg-muted justify-center transition-colors hover:bg-muted/50 flex items-center">
                        <HeartIconDisabled className="h-5 w-5 text-muted-foreground" />
                    </button>
                </div>
                <Separator className="w-full" />
                <div className="line-clamp-2 text-sm text-muted-foreground">
                    {description}
                </div>
                <h3 className="text-base text-brand sm:text-lg">Customizable</h3>
                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
                    {discount !== undefined && discount > 0 ? (
                        <>
                            <div className="flex flex-col items-start">
                                <span className="text-base font-medium text-muted-foreground line-through sm:text-lg">EGP {price.toFixed(2)}</span>
                                <h1 className="text-2xl font-bold tracking-tighter text-secondary sm:text-3xl">EGP {(price * (1 - discount / 100)).toFixed(2)}</h1>
                            </div>
                        </>
                    ) : (
                        <h1 className="text-2xl font-bold tracking-tighter text-secondary sm:text-3xl">EGP {price.toFixed(2)}</h1>
                    )}
                    <button className="rounded-full bg-brand px-4 py-2 text-xs font-semibold uppercase text-white transition-all hover:opacity-90 sm:text-sm cursor-pointer hover:scale-105 active:scale-95">Add to Cart</button>
                </div>
            </div>
        </div>

    )
}

export default ProductCard