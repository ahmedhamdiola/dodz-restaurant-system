import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "../../../components/toast/context";
import { usersApi } from "../services/usersApi";
import type { CreateAdminUserInput } from "../types";

export const adminUserKeys = {
    list: ["admin", "users"] as const,
};

export const useAdminUsers = () =>
    useQuery({
        queryKey: adminUserKeys.list,
        queryFn: usersApi.getUsers,
    });

export const useCreateAdminUser = () => {
    const queryClient = useQueryClient();
    const toast = useToast();

    return useMutation({
        mutationFn: (input: CreateAdminUserInput) => usersApi.createUser(input),
        onSuccess: (user) => {
            toast.success(`Account created for ${user.name}`);
            queryClient.invalidateQueries({ queryKey: adminUserKeys.list });
        },
        onError: (error: Error) => {
            toast.error(error.message || "Could not create the account");
        },
    });
};
