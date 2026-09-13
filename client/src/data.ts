import DeliveryIcon from "./assets/icons/delivery-icon.svg"
import DineInIcon from "./assets/icons/dine-in-icon.svg"
import PickupIcon from "./assets/icons/pickup-icon.svg"
import type { HeroSlide } from "./features/landing/hero/types";
export const NAVBAR_ORDER_BUTTONS = [
    {
        title: "Delivery",
        Icon: DeliveryIcon,
    },
    {
        title: "Pickup",
        Icon: PickupIcon,
    },
    {
        title: "Dine In",
        Icon: DineInIcon,
    }
]

export const heroSlides: HeroSlide[] = [
    {
        eyebrow: "Crispy & Juicy",
        title: "Fried Chicken Done Right",
        description: "Premium quality fried chicken, made fresh for everyone.",
        cta: "Order Now",
        gradient: "from-[#e10000] via-[#ff4d00] to-[#ffb300]",
    },
    {
        eyebrow: "Family Meals",
        title: "Big Buckets, Bigger Smiles",
        description: "Share the goodness with our family-sized buckets and combos.",
        cta: "Explore Menu",
        gradient: "from-[#960000] via-[#e10000] to-[#ff6b00]",
    },
    {
        eyebrow: "Fast Delivery",
        title: "Hot & Fresh at Your Door",
        description: "Track your order in real time and get it delivered piping hot.",
        cta: "Track Order",
        gradient: "from-[#1b2027] via-[#5c2e2e] to-[#e10000]",
    },
];