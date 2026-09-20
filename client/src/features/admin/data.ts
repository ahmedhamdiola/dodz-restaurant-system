import {
    BanknotesIcon,
    ClipboardDocumentListIcon,
    ShoppingBagIcon,
    UsersIcon,
} from "@heroicons/react/24/outline";
import type {
    AdminBranch,
    AdminOrder,
    AdminProduct,
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

export const RECENT_ORDERS: AdminOrder[] = [
    { id: "DZ-10482", customer: "Omar Khaled", items: "Festival Box, 2 Fizzy Cola", total: 966.7, status: "Completed", date: "Sep 20, 6:42 PM" },
    { id: "DZ-10481", customer: "Sara Mostafa", items: "Super Nashville Tender", total: 370, status: "On the way", date: "Sep 20, 6:21 PM" },
    { id: "DZ-10480", customer: "Youssef Adel", items: "Mega Star Family Meal", total: 1035, status: "Preparing", date: "Sep 20, 5:58 PM" },
    { id: "DZ-10479", customer: "Mariam Nabil", items: "Doodz Snack", total: 160, status: "Completed", date: "Sep 20, 5:47 PM" },
    { id: "DZ-10478", customer: "Ahmed Samir", items: "Double Dip, Hot Honey", total: 652.8, status: "Cancelled", date: "Sep 20, 5:16 PM" },
];

export const ALL_ORDERS: AdminOrder[] = [
    { id: "DZ-10482", customer: "Omar Khaled", items: "Festival Box, 2 Fizzy Cola", total: 966.7, status: "Completed", date: "Sep 20, 6:42 PM" },
    { id: "DZ-10481", customer: "Sara Mostafa", items: "Super Nashville Tender", total: 370, status: "On the way", date: "Sep 20, 6:21 PM" },
    { id: "DZ-10480", customer: "Youssef Adel", items: "Mega Star Family Meal", total: 1035, status: "Preparing", date: "Sep 20, 5:58 PM" },
    { id: "DZ-10479", customer: "Mariam Nabil", items: "Doodz Snack", total: 160, status: "Completed", date: "Sep 20, 5:47 PM" },
    { id: "DZ-10478", customer: "Ahmed Samir", items: "Double Dip, Hot Honey", total: 652.8, status: "Cancelled", date: "Sep 20, 5:16 PM" },
    { id: "DZ-10477", customer: "Nour El Din", items: "Nashy", total: 694.8, status: "Completed", date: "Sep 20, 4:03 PM" },
    { id: "DZ-10476", customer: "Hana Ibrahim", items: "Family Mix Meal", total: 805, status: "Preparing", date: "Sep 20, 3:41 PM" },
    { id: "DZ-10475", customer: "Karim Hassan", items: "Secret De Sandwich, Curly Fries", total: 230, status: "Completed", date: "Sep 20, 3:12 PM" },
    { id: "DZ-10474", customer: "Laila Mohamed", items: "Tender Meal", total: 610, status: "On the way", date: "Sep 20, 2:48 PM" },
    { id: "DZ-10473", customer: "Mohamed Tarek", items: "Cheesy Fries, T Ranch", total: 235, status: "Cancelled", date: "Sep 20, 2:09 PM" },
    { id: "DZ-10472", customer: "Farah Ali", items: "Buffalo Ranch Wings, Fizzy Cola", total: 120, status: "Completed", date: "Sep 20, 1:37 PM" },
    { id: "DZ-10471", customer: "Seif Adel", items: "Star Meal", total: 905, status: "Completed", date: "Sep 20, 12:55 PM" },
];

export const ADMIN_PRODUCTS: AdminProduct[] = [
    { id: 1, name: "Festival Box", category: "Bundles", price: 966.7, stock: 42, sold: 1284, status: "Active" },
    { id: 2, name: "Mega Star Family Meal", category: "Family Meals", price: 1035, stock: 18, sold: 967, status: "Active" },
    { id: 3, name: "Double Dip", category: "Bundles", price: 652.8, stock: 0, sold: 986, status: "Out of stock" },
    { id: 4, name: "Super Nashville Tender", category: "Single Meals", price: 370, stock: 73, sold: 812, status: "Active" },
    { id: 5, name: "Nashville Loaded Fries", category: "Appetizers", price: 145, stock: 12, sold: 521, status: "Active" },
    { id: 6, name: "Truffle D Sandwich", category: "Burger", price: 175, stock: 60, sold: 433, status: "Active" },
    { id: 7, name: "Hot Honey Wings", category: "Chicken Wings", price: 85, stock: 0, sold: 88, status: "Out of stock" },
    { id: 8, name: "Mango Summer Breeze", category: "Drinks", price: 45, stock: 0, sold: 0, status: "Draft" },
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