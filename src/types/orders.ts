export type ShippingAddressDto = {
    receiverName: string;
    receiverFamily: string;
    nationalId: string;
    mobile: string;
    email: string;
    address: string;
    postalCode: string;
    province: string;
    city: string;
};

export type OrderLineDto = {
    saleItemId: string;
    saleEntityId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    imageUrl?: string;
    size?: string;
    colors?: string[] | string;
};

export type OrderDto = {
    orderNo: string;
    userId?: string;
    anonymousId?: string;
    lines: OrderLineDto[];
    subtotal: number;
    shipping: number;
    total: number;
    shippingAddress: ShippingAddressDto;
    messageToShop?: string;
    status: string;
    createdAt: string;

    isSentByPost: boolean;
    sentAt?: string;
    sentBy?: string;
    trackingNumber?: string;
};

export type PagedResult<T> = {
    items: T[];
    page: number;
    pageSize: number;
    total: number; // backend returns 'Total'; if it's 'totalCount' adjust below service
};
