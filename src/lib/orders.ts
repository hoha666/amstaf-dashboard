import { PagedResult, OrderDto } from "@/types/orders";

const BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export async function adminSearchOrders(params: {
    isSentByPost?: boolean;
    q?: string;
    page?: number;
    pageSize?: number;
}): Promise<PagedResult<OrderDto>> {
    const url = new URL(`${BASE}/api/admin/orders`);
    if (params.isSentByPost !== undefined) url.searchParams.set("isSentByPost", String(params.isSentByPost));
    if (params.q) url.searchParams.set("q", params.q);
    url.searchParams.set("page", String(params.page ?? 1));
    url.searchParams.set("pageSize", String(params.pageSize ?? 20));

    const res = await fetch(url.toString(), { credentials: "include" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function adminGetOrder(orderNo: string): Promise<OrderDto> {
    const res = await fetch(`${BASE}/api/admin/orders/${orderNo}`, { credentials: "include" });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
}

export async function adminMarkSent(orderNo: string, trackingNumber?: string): Promise<void> {
    const res = await fetch(`${BASE}/api/admin/orders/${orderNo}/mark-sent`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ orderNo, trackingNumber })
    });
    if (!res.ok) throw new Error(await res.text());
}
