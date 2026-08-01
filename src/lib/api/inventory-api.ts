/**
 * Inventory App — products + stock transactions
 */

import { apiClient } from '@/lib/api';
import type { ApiPaginatedResponse } from '@/types/api-types';

export interface BackendProduct {
    id: string;
    name: string;
    sku: string;
    price: string;
    location: string;
    location_name?: string;
    stock_quantity?: number;
    quantity_on_hand?: number;
}

export interface BackendStockTransaction {
    id: string;
    product: string;
    product_name?: string;
    quantity: number;
    transaction_type: string;
    notes?: string;
    created_at?: string;
}

function unwrapList<T>(response: T[] | ApiPaginatedResponse<T>): T[] {
    return Array.isArray(response) ? response : response.results ?? [];
}

export async function fetchProductsFromApi(): Promise<BackendProduct[]> {
    const response = await apiClient.get<
        BackendProduct[] | ApiPaginatedResponse<BackendProduct>
    >('/inventory/products/');
    return unwrapList(response);
}

export async function createProductApi(payload: {
    name: string;
    sku: string;
    price: string;
    location: string;
}): Promise<BackendProduct> {
    return apiClient.post<BackendProduct>('/inventory/products/', payload);
}

export async function updateProductApi(
    id: string,
    payload: Partial<{
        name: string;
        sku: string;
        price: string;
        location: string;
    }>
): Promise<BackendProduct> {
    return apiClient.patch<BackendProduct>(`/inventory/products/${id}/`, payload);
}

export async function deleteProductApi(id: string): Promise<void> {
    await apiClient.delete(`/inventory/products/${id}/`);
}

export async function fetchStockTransactionsFromApi(): Promise<BackendStockTransaction[]> {
    const response = await apiClient.get<
        BackendStockTransaction[] | ApiPaginatedResponse<BackendStockTransaction>
    >('/inventory/stock-transactions/');
    return unwrapList(response);
}

export async function createStockTransactionApi(payload: {
    product: string;
    quantity: number;
    transaction_type: string;
    notes?: string;
}): Promise<BackendStockTransaction> {
    return apiClient.post<BackendStockTransaction>(
        '/inventory/stock-transactions/',
        payload
    );
}

export async function updateStockTransactionApi(
    id: string,
    payload: Partial<{
        product: string;
        quantity: number;
        transaction_type: string;
        notes: string;
    }>
): Promise<BackendStockTransaction> {
    return apiClient.patch<BackendStockTransaction>(
        `/inventory/stock-transactions/${id}/`,
        payload
    );
}

export async function deleteStockTransactionApi(id: string): Promise<void> {
    await apiClient.delete(`/inventory/stock-transactions/${id}/`);
}
