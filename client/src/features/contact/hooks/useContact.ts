import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contactService } from "../services/contactService";
import { contactKeys } from "../queryKeys";
import type { ContactFormValues } from "../types";

export const useContacts = () => {
    return useQuery({
        queryKey: contactKeys.list(),
        queryFn: contactService.getAll,
    });
};

export const useSendContactMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (values: ContactFormValues) => contactService.sendMessage(values),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: contactKeys.all });
        },
    });
};