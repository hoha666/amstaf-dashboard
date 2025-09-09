// src/services/products.ts
import api from "../lib/axios";

// Media type
export interface ProductMedia {
    url: string;
    type: string;
    mimeType: string;
    size: number;
    isUploadComplete: boolean;
}

// Full product type (as returned by backend)
export interface Product {
    id: string;
    name: string;
    price: number;
    stock: number;
    size: string;
    color: string;
    productType: string;
    description?: string;
    media?: ProductMedia[];
}

// DTO for creating new product (backend does not require id or media)
export type CreateProductDTO = Omit<Product, "id" | "media">;

// Get all products
export const getProducts = async (): Promise<Product[]> => {
    const response = await api.get<Product[]>("/products");
    return response.data;
};

// Get product by ID
export const getProductById = async (id: string): Promise<Product> => {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
};

// Create product
export const createProduct = async (product: CreateProductDTO): Promise<Product> => {
    const response = await api.post<Product>("/products", product);
    return response.data;
};

// Update product
export const updateProduct = async (
    id: string,
    product: Partial<CreateProductDTO>
): Promise<Product> => {
    const response = await api.put<Product>(`/products/${id}`, product);
    return response.data;
};

// Delete product
export const deleteProduct = async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
};

// Add one media file to a product
// Upload one file
export const addMediaToProduct = async (id: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("MediaFile", file);

    await api.post(`/products/${id}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
};

// Delete by URL
export const deleteMediaFromProduct = async (id: string, mediaUrl: string): Promise<void> => {
    await api.delete(`/products/${id}/media`, {
        params: { mediaUrl },
    });
};

