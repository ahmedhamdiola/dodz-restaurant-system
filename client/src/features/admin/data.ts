import {
    BanknotesIcon,
    ClipboardDocumentListIcon,
    ShoppingBagIcon,
    UsersIcon,
} from "@heroicons/react/24/outline";
import type {
    AdminBranch,
    AdminUser,
    OrderStatusSlice,
    RevenuePoint,
    Stat,
    TopProduct,
} from "./types";

export const DASHBOARD_STATS: Stat[] = [
    {
        label: "Total Revenue",
        value: "EGP 1,163,100",
        change: 13.4,
        Icon: BanknotesIcon,
    },
    {
        label: "Orders Today",
        value: "1,248",
        change: 8.2,
        Icon: ClipboardDocumentListIcon,
    },
    {
        label: "Total Users",
        value: "24,367",
        change: 5.1,
        Icon: UsersIcon,
    },
    {
        label: "Avg Order Value",
        value: "EGP 285",
        change: -2.3,
        Icon: ShoppingBagIcon,
    },
];

export const REVENUE_LAST_7_DAYS: RevenuePoint[] = [
    { day: "Sun", revenue: 142_000 },
    { day: "Mon", revenue: 128_500 },
    { day: "Tue", revenue: 156_700 },
    { day: "Wed", revenue: 149_200 },
    { day: "Thu", revenue: 173_800 },
    { day: "Fri", revenue: 214_600 },
    { day: "Sat", revenue: 198_300 },
];

export const ORDER_STATUS_SLICES: OrderStatusSlice[] = [
    { label: "Completed", count: 1024 },
    { label: "Preparing", count: 298 },
    { label: "On the way", count: 142 },
    { label: "Cancelled", count: 84 },
];

export const TOP_PRODUCTS: TopProduct[] = [
    { name: "Festival Box", sold: 1284, revenue: 1241000, share: 92 },
    { name: "Double Dip", sold: 986, revenue: 643700, share: 76 },
    { name: "Super Nashville Tender", sold: 812, revenue: 300400, share: 58 },
    { name: "Family Meal", sold: 764, revenue: 527200, share: 49 },
    { name: "Solo Crave", sold: 655, revenue: 208000, share: 41 },
];

export const ADMIN_USERS: AdminUser[] = [
    { id: 1, name: "Mostafa El Din", email: "mostafa.eldin@gmail.com", role: "Owner", orders: 0, joined: "Jan 12, 2024", status: "Active" },
    { id: 2, name: "Salma Fathy", email: "salma.fathy@yahoo.com", role: "Manager", orders: 0, joined: "Feb 3, 2024", status: "Active" },
    { id: 3, name: "Ahmed Hassan", email: "ahmed.hassan@hotmail.com", role: "Cashier", orders: 341, joined: "Mar 18, 2024", status: "Active" },
    { id: 4, name: "Nour Amin", email: "nour.amin@gmail.com", role: "Cashier", orders: 287, joined: "Apr 2, 2024", status: "Active" },
    { id: 5, name: "Kareem Sobhy", email: "kareem.sobhy@yahoo.com", role: "Chef", orders: 0, joined: "May 27, 2024", status: "Active" },
    { id: 6, name: "Dina Sherif", email: "dina.sherif@hotmail.com", role: "Delivery", orders: 519, joined: "Jun 15, 2024", status: "Active" },
    { id: 7, name: "Omar Yousef", email: "omar.yousef@gmail.com", role: "Delivery", orders: 462, joined: "Jul 9, 2024", status: "Suspended" },
    { id: 8, name: "Hala Mostafa", email: "hala.mostafa@yahoo.com", role: "Customer", orders: 23, joined: "Aug 1, 2025", status: "Active" },
];

export const ADMIN_BRANCHES: AdminBranch[] = [
    {
        id: 1,
        name: "DODZ El Tagamoa",
        area: "New Cairo",
        address: "Al-Banafseg 10 villas, Dr. Ahmed Okasha St., The Place Mall, next to the British School",
        hours: "Open daily",
        phone: "16974",
        status: "Open",
    },
    {
        id: 2,
        name: "DODZ Nasr City",
        area: "Nasr City",
        address: "Mahdi Arafa St., 10th District, next to Awlad Ragab and in front of Al-Massa Hospital",
        hours: "Open 24 hours",
        phone: "16974",
        status: "Open",
    },
    {
        id: 3,
        name: "DODZ Ain Shams",
        area: "Ain Shams",
        address: "36 Ain Shams Main St., Al-Naam Square, in front of Haty Ahmed Neda restaurant",
        hours: "10:00 AM – 9:15 PM",
        phone: "16974",
        status: "Open",
    },
    {
        id: 4,
        name: "DODZ Almaza",
        area: "Heliopolis",
        address: "72 El-Horreya St., Almaza, Heliopolis, next to Yokal Restaurant",
        hours: "Open daily",
        phone: "16974",
        status: "Open",
    },
    {
        id: 5,
        name: "DODZ Hadayek El Kobba",
        area: "Hadayek El Kobba",
        address: "Saraya Mall, Wali Al Ahd St., Al Qobba Gardens, next to McDonald's",
        hours: "Open daily",
        phone: "16974",
        status: "Closed",
    },
];