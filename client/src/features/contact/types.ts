export interface ContactFormValues {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    created_at: string;
}

import type { ComponentType, SVGProps } from "react";

export interface ContactInfoItem {
    label: string;
    value: string;
    href?: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
}