// src/services/orders.ts
import api from "@/lib/axios";
import type { OrderDto, PagedResult } from "@/types/orders";

/**
 * Search orders (admin)
 * Supports: isSentByPost filter, free-text query (q), pagination.
 * Accepts AbortSignal to prevent React StrictMode double-fetch issues.
 */
export async function adminSearchOrders(
    params: { isSentByPost?: boolean; q?: string; page?: number; pageSize?: number },
    signal?: AbortSignal
): Promise<PagedResult<OrderDto>> {
    const res = await api.get("/admin/orders", {
        params: {
            isSentByPost: params.isSentByPost,
            q: params.q,
            page: params.page ?? 1,
            pageSize: params.pageSize ?? 20,
        },
        signal, // enable cancellation on unmount/re-render
    });

    // Normalize shape if backend uses `totalCount`
    const data = res.data;
    if (data && data.totalCount !== undefined && data.total === undefined) {
        data.total = data.totalCount;
    }
    return data;
}

/** Get a single order by order number (admin) */
export async function adminGetOrder(orderNo: string): Promise<OrderDto> {
    const res = await api.get(`/admin/orders/${encodeURIComponent(orderNo)}`);
    return res.data;
}

/** Mark order as sent (admin) */
export async function adminMarkSent(orderNo: string, trackingNumber?: string): Promise<void> {
    await api.patch(`/admin/orders/${encodeURIComponent(orderNo)}/mark-sent`, {
        orderNo,
        trackingNumber: trackingNumber || undefined,
    });
}
