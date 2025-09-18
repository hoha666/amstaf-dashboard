// src/services/saleItems.ts
import api from "@/lib/axios";

// Shared shapes
export type PagedResult<T> = {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
};

export type ItemMedia = {
    url: string;
    type: string;
    mimeType: string;
    size: number;
    isUploadComplete: boolean;
};

export type SaleEntity = {
    id?: string;
    colors: string[];
    media: ItemMedia[];
    price: number;
    stock: number;
    size: string;
    isPublished: boolean;
    createdAt: string;
    updatedAt?: string | null;
};

export type SaleItem = {
    id: string;
    name: string;
    itemType: string;
    saleEntities: SaleEntity[];
    createdAt: string;
    updatedAt?: string | null;
};

// Query contracts
export type SaleItemQuery = {
    name?: string;
    itemType?: string;
    hasMedia?: boolean;
    color?: string;
    sortBy?: "name" | "createdAt" | "updatedAt";
    sortDir?: "asc" | "desc";
    page?: number;
    pageSize?: number;
};

export type SaleEntityQuery = {
    hasMedia?: boolean;
    color?: string;
    sortBy?: "createdAt" | "updatedAt" | "price" | "stock" | "size";
    sortDir?: "asc" | "desc";
    page?: number;
    pageSize?: number;
    published?: boolean;
};

// ---------------- SaleItems (root) ----------------
export async function searchSaleItems(q: SaleItemQuery): Promise<PagedResult<SaleItem>> {
    const res = await api.get<PagedResult<SaleItem>>("/sale-items", { params: q });
    return res.data;
}

export async function getSaleItem(id: string): Promise<SaleItem> {
    const res = await api.get<SaleItem>(`/sale-items/${id}`);
    return res.data;
}

export async function createSaleItem(payload: Pick<SaleItem, "name" | "itemType">): Promise<string> {
    const res = await api.post<{ id: string }>("/sale-items", payload);
    return res.data.id;
}

export async function updateSaleItem(id: string, payload: Partial<Pick<SaleItem, "name" | "itemType">>): Promise<void> {
    await api.put(`/sale-items/${id}`, payload);
}

export async function deleteSaleItem(id: string): Promise<void> {
    await api.delete(`/sale-items/${id}`);
}

// ---------------- SaleEntities (children) ----------------
export async function listSaleEntities(saleItemId: string, q: SaleEntityQuery): Promise<PagedResult<SaleEntity>> {
    const res = await api.get<PagedResult<SaleEntity>>(`/sale-items/${saleItemId}/entities`, { params: q });
    return res.data;
}

export async function addSaleEntity(saleItemId: string, entity: Partial<SaleEntity>): Promise<void> {
    await api.post(`/sale-items/${saleItemId}/entities`, entity);
}

export async function updateSaleEntity(saleItemId: string, entityId: string, entity: Partial<SaleEntity>): Promise<void> {
    await api.put(`/sale-items/${saleItemId}/entities/${entityId}`, entity);
}

export async function removeSaleEntity(saleItemId: string, entityId: string): Promise<void> {
    await api.delete(`/sale-items/${saleItemId}/entities/${entityId}`);
}

// ---------------- Media (per SaleEntity) ----------------
export async function uploadSaleEntityMedia(
    saleItemId: string,
    entityId: string,
    file: File
): Promise<ItemMedia> {
    const form = new FormData();
    form.append("file", file, file.name);

    const res = await api.post<ItemMedia>(
        `/sale-items/${saleItemId}/entities/${entityId}/media`,
        form,
        {
            // remove the global default 'application/json' so the browser sets multipart with boundary
            transformRequest: [(data, headers) => {
                if (headers) {
                    // Axios normalizes header names internally
                    delete (headers as any)["Content-Type"];
                }
                return data;
            }],
        }
    );

    return res.data;
}

export async function deleteSaleEntityMedia(saleItemId: string, entityId: string, fileUrl: string): Promise<void> {
    await api.delete(`/sale-items/${saleItemId}/entities/${entityId}/media`, { params: { fileUrl } });
}
