export interface ContactFormValues {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
}

import type { ComponentType, SVGProps } from "react";

export interface ContactInfoItem {
    label: string;
    value: string;
    href?: string;
    Icon: ComponentType<SVGProps<SVGSVGElement>>;
}