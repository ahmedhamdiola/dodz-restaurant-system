import { api, unwrap } from "../../../lib/api";
import type { ContactFormValues, ContactMessage } from "../types";

export const contactService = {
    getAll(): Promise<ContactMessage[]> {
        return unwrap(api.get("/contact"));
    },
    sendMessage(values: ContactFormValues): Promise<ContactMessage> {
        return unwrap(api.post("/contact", values));
    },
};