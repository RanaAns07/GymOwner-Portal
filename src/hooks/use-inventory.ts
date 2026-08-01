import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
    fetchProductsFromApi,
    createProductApi,
    updateProductApi,
    deleteProductApi,
    fetchStockTransactionsFromApi,
    createStockTransactionApi,
    deleteStockTransactionApi,
} from '@/lib/api/inventory-api';

export const inventoryKeys = {
    all: ['inventory'] as const,
    products: () => [...inventoryKeys.all, 'products'] as const,
    transactions: () => [...inventoryKeys.all, 'transactions'] as const,
};

export function useProducts() {
    return useQuery({
        queryKey: inventoryKeys.products(),
        queryFn: fetchProductsFromApi,
    });
}

export function useCreateProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createProductApi,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: inventoryKeys.products() });
            toast.success('Product created.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to create product'),
    });
}

export function useUpdateProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            data,
        }: {
            id: string;
            data: Parameters<typeof updateProductApi>[1];
        }) => updateProductApi(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: inventoryKeys.products() });
            toast.success('Product updated.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to update product'),
    });
}

export function useDeleteProduct() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteProductApi,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: inventoryKeys.products() });
            toast.success('Product removed.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to remove product'),
    });
}

export function useStockTransactions() {
    return useQuery({
        queryKey: inventoryKeys.transactions(),
        queryFn: fetchStockTransactionsFromApi,
    });
}

export function useCreateStockTransaction() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: createStockTransactionApi,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: inventoryKeys.transactions() });
            qc.invalidateQueries({ queryKey: inventoryKeys.products() });
            toast.success('Stock transaction recorded.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to record transaction'),
    });
}

export function useDeleteStockTransaction() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: deleteStockTransactionApi,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: inventoryKeys.transactions() });
            qc.invalidateQueries({ queryKey: inventoryKeys.products() });
            toast.success('Transaction removed.');
        },
        onError: (e) => toast.error(e instanceof Error ? e.message : 'Failed to remove transaction'),
    });
}
