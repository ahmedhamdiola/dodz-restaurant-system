import { memo } from 'react'
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import Separator from '../../../components/ui/Separator'
import { useFavorites } from '../favorites/useFavorites'

interface ProductCardProps {
    id: number,
    name: string,
    description: string,
    image: string,
    price: number,
    discount?: number,
}

const formatPrice = (value: number) =>
    value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const ProductCard = ({ id, name, description, image, price, discount }: ProductCardProps) => {
    const { isFavorite, toggleFavorite } = useFavorites()
    const favorited = isFavorite(id)
    return (
        <div className="w-full max-w-[250px] rounded-2xl border border-border bg-card p-2.5 shadow-sm transition-shadow hover:shadow-md cursor-pointer">
            <div className="flex w-full flex-col gap-1.5">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-muted">
                    <img src={image} alt={name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                </div>
                <div className="flex items-center justify-between gap-2">
                    <h2 className="truncate text-base font-bold text-secondary sm:text-lg">{name}</h2>
                    <button type="button" onClick={() => toggleFavorite(id)} aria-pressed={favorited} title={favorited ? "Remove from favorites" : "Add to favorites"} className="h-7 w-7 shrink-0 cursor-pointer rounded-full bg-muted justify-center transition-colors hover:bg-muted/50 flex items-center">
                        {favorited ? (
                            <HeartIconSolid className="h-4 w-4 text-red-500" />
                        ) : (
                            <HeartIconOutline className="h-4 w-4 text-muted-foreground" />
                        )}
                    </button>
                </div>
                <Separator className="w-full" />
                <div className="line-clamp-2 min-h-8 text-xs text-muted-foreground">
                    {description}
                </div>
                <h3 className="text-sm text-brand sm:text-xs">Customizable</h3>
                <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    {discount !== undefined && discount > 0 ? (
                        <div className="relative min-w-0 flex-1 overflow-hidden">
                            <span className="absolute left-0 top-[-0.9rem] whitespace-nowrap text-[10px] font-medium text-muted-foreground line-through sm:text-xs">EGP {formatPrice(price)}</span>
                            <h1 className="whitespace-nowrap text-base font-bold tracking-tighter text-secondary sm:text-lg">EGP {formatPrice(price * (1 - discount / 100))}</h1>
                        </div>
                    ) : (
                        <h1 className="whitespace-nowrap text-base font-bold tracking-tighter text-secondary sm:text-lg">EGP {formatPrice(price)}</h1>
                    )}
                    <button className="shrink-0 rounded-full bg-brand px-2.5 py-1.5 text-[10px] font-semibold uppercase text-white transition-all hover:opacity-90 sm:text-xs cursor-pointer hover:scale-105 active:scale-95">Add to Cart</button>
                </div>
            </div>
        </div>

    )
}

export default memo(ProductCard)