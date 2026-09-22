import { useQuery } from "@tanstack/react-query";
import { MENU_STALE_TIME } from "../../menu/queryKeys";
import { productsApi } from "../services/productsApi";

const adminProductsKey = (["admin", "products"] as const);

export const useAdminProducts = () =>
    useQuery({
        queryKey: adminProductsKey,
        queryFn: productsApi.getAdminProducts,
        staleTime: MENU_STALE_TIME,
    });