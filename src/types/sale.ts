export type ItemMediaDto = {
    url: string;
    type: string;        // "image" | "video" | "binary"
    mimeType: string;
    size: number;
    isUploadComplete: boolean;
};

export type SaleEntityDto = {
    id?: string;
    colors: string[];
    media: ItemMediaDto[];
    price: number;
    stock: number;
    size: string;
    createdAt: string;
    updatedAt?: string | null;
};

export type SaleItemDto = {
    id?: string;
    name: string;
    itemType: string;
    saleEntities?: SaleEntityDto[];
    createdAt: string;
    updatedAt?: string | null;
};

export type PagedResult<T> = {
    items: T[];
    page: number;
    pageSize: number;
    totalCount: number;
};

export type SaleItemQuery = {
    name?: string;
    itemType?: string;
    hasMedia?: boolean;
    color?: string;
    sortBy?: "createdAt" | "updatedAt" | "name";
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
};
