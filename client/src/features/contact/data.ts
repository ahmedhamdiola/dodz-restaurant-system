import { MapPinIcon, PhoneIcon } from "@heroicons/react/24/outline";
import type { ContactInfoItem } from "./types";

export const CONTACT_SUBJECTS = [
    "General Inquiry",
    "Feedback",
    "Complaint",
    "Order Support",
    "Partnership",
    "Other",
] as const;

export const CONTACT_INFO: ContactInfoItem[] = [
    {
        label: "Call our hotline",
        value: "16974",
        href: "tel:16974",
        Icon: PhoneIcon,
    },
    {
        label: "Find a branch",
        value: "Tap to explore our store locations",
        href: "/store-locations",
        Icon: MapPinIcon,
    }
];