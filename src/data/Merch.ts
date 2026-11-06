import initialMerch from '../../data/post-merch.json';
import type { CmsMerchProduct } from './CmsTypes';

export const LOW_STOCK_THRESHOLD = 5;
export const FREE_SHIPPING_THRESHOLD = 999;
export const STANDARD_SHIPPING_COST = 149;

export const MERCH_STORAGE_KEY = 'tom_cms_merch_catalog_v1';
export const MERCH_CART_STORAGE_KEY = 'tom_merch_cart_v1';
export const MERCH_ORDERS_STORAGE_KEY = 'tom_merch_orders_v1';
export const MERCH_UPDATED_EVENT = 'tom-merch-updated';

export interface MerchCartItem {
    productId: string;
    quantity: number;
}

export type StockLevelStatus = 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface StockBadgeInfo {
    status: StockLevelStatus;
    label: string;
    badgeClassName: string;
    dotClassName: string;
}

export type PaymentMethodType = 'CARD' | 'SPEI' | 'OXXO' | 'PAYPAL';
export type DeliveryMethodType = 'SHIPPING' | 'PICKUP';
export type PaymentPlanType = 'CONTADO' | 'CREDITO';
export type CreditDebtStatus = 'DEBT_ALL' | 'PARTIAL' | 'LIQUIDATED';

export interface MerchOrderItem {
    productId: string;
    code: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
    image?: string;
}

export interface MerchInstallmentPayment {
    installmentNumber: number;
    dueDate: string;
    amount: number;
    paid: boolean;
    paidAt?: string;
}

export interface MerchOrderRecord {
    orderId: string;
    authCode: string;
    createdAt: string;
    createdAtTimestamp: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryMethod: DeliveryMethodType;
    shippingAddress: string;
    paymentMethod: PaymentMethodType;
    paymentPlanType: PaymentPlanType;
    paymentSummary: string;
    installments: number;
    installmentSchedule: MerchInstallmentPayment[];
    couponCode?: string;
    subtotal: number;
    discount: number;
    shippingCost: number;
    total: number;
    status: 'PAGADO' | 'PENDIENTE_PAGO';
    items: MerchOrderItem[];
}

export interface PromoCoupon {
    code: string;
    type: 'PERCENT' | 'FIXED';
    value: number;
    description: string;
}

export const PROMO_COUPONS: Record<string, PromoCoupon> = {
    METAL10: {
        code: 'METAL10',
        type: 'PERCENT',
        value: 10,
        description: '10% de descuento en toda la mercancía',
    },
    MOSHPIT15: {
        code: 'MOSHPIT15',
        type: 'PERCENT',
        value: 15,
        description: '15% de descuento especial Moshpit',
    },
    TOMVIP: {
        code: 'TOMVIP',
        type: 'FIXED',
        value: 100,
        description: '$100.00 MXN de descuento directo',
    },
};

export const detectCardBrand = (cardNumber: string): 'VISA' | 'MASTERCARD' | 'AMEX' | 'CARD' => {
    const digits = cardNumber.replace(/\D/g, '');
    if (/^4/.test(digits)) return 'VISA';
    if (/^(5[1-5]|2[2-7])/.test(digits)) return 'MASTERCARD';
    if (/^3[47]/.test(digits)) return 'AMEX';
    return 'CARD';
};

export const normalizeMerchProduct = (raw: Partial<CmsMerchProduct> & { id: string }): CmsMerchProduct => ({
    id: raw.id,
    code: raw.code ?? 'TOM-MER-0000',
    name: raw.name ?? 'Producto sin nombre',
    category: raw.category ?? 'OTROS',
    description: raw.description ?? '',
    price: typeof raw.price === 'number' && Number.isFinite(raw.price) ? raw.price : 0,
    stock: typeof raw.stock === 'number' && Number.isFinite(raw.stock)
        ? Math.max(0, Math.floor(raw.stock))
        : 10,
    image: raw.image ?? '',
    purchaseUrl: raw.purchaseUrl ?? '',
    status: raw.status ?? 'PUBLICADO',
    publish: raw.publish ?? '',
});

export const INITIAL_CMS_MERCH: CmsMerchProduct[] = (initialMerch as CmsMerchProduct[]).map(
    normalizeMerchProduct,
);

export const getStockBadgeInfo = (availableStock: number): StockBadgeInfo => {
    const safeStock = Math.max(0, Math.floor(availableStock));
    if (safeStock === 0) {
        return {
            status: 'OUT_OF_STOCK',
            label: 'AGOTADO · SIN EXISTENCIAS',
            badgeClassName: 'bg-red-950/80 border-red-600/60 text-red-400',
            dotClassName: 'bg-red-500',
        };
    }
    if (safeStock <= LOW_STOCK_THRESHOLD) {
        return {
            status: 'LOW_STOCK',
            label: safeStock === 1
                ? '¡POCAS UNIDADES! · ÚLTIMA UNIDAD'
                : `¡POCAS UNIDADES! · QUEDAN ${safeStock}`,
            badgeClassName: 'bg-amber-950/80 border-amber-500/60 text-amber-400',
            dotClassName: 'bg-amber-400 animate-pulse',
        };
    }
    return {
        status: 'AVAILABLE',
        label: `EN EXISTENCIA · ${safeStock} DISPONIBLES`,
        badgeClassName: 'bg-emerald-950/80 border-emerald-600/60 text-emerald-400',
        dotClassName: 'bg-emerald-400',
    };
};

export const readStoredMerchCatalog = (): CmsMerchProduct[] => {
    if (typeof window === 'undefined') return INITIAL_CMS_MERCH;
    try {
        const raw = window.localStorage.getItem(MERCH_STORAGE_KEY);
        if (!raw) return INITIAL_CMS_MERCH;
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed) || parsed.length === 0) return INITIAL_CMS_MERCH;
        return parsed.map((item) => normalizeMerchProduct(item as CmsMerchProduct));
    } catch {
        return INITIAL_CMS_MERCH;
    }
};

export const writeStoredMerchCatalog = (products: CmsMerchProduct[]): void => {
    if (typeof window === 'undefined') return;
    try {
        const normalized = products.map(normalizeMerchProduct);
        window.localStorage.setItem(MERCH_STORAGE_KEY, JSON.stringify(normalized));
        window.dispatchEvent(new CustomEvent(MERCH_UPDATED_EVENT, { detail: normalized }));
    } catch (error) {
        console.error('No se pudo guardar el inventario de mercancía localmente:', error);
    }
};

export const readStoredMerchCart = (): Record<string, number> => {
    if (typeof window === 'undefined') return {};
    try {
        const raw = window.localStorage.getItem(MERCH_CART_STORAGE_KEY);
        if (!raw) return {};
        const parsed: unknown = JSON.parse(raw);
        if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {};
        const result: Record<string, number> = {};
        for (const [key, val] of Object.entries(parsed)) {
            if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
                result[key] = Math.floor(val);
            }
        }
        return result;
    } catch {
        return {};
    }
};

export const writeStoredMerchCart = (cart: Record<string, number>): void => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(MERCH_CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
        console.error('No se pudo guardar el carrito de compras:', error);
    }
};

export const buildInstallmentSchedule = (
    total: number,
    installments: number,
    baseDate: Date = new Date(),
): MerchInstallmentPayment[] => {
    const safeInstallments = Math.max(1, Math.floor(installments));
    if (safeInstallments <= 1) return [];

    const baseAmount = Math.floor((total / safeInstallments) * 100) / 100;
    const schedule: MerchInstallmentPayment[] = [];

    for (let i = 1; i <= safeInstallments; i += 1) {
        const due = new Date(baseDate);
        due.setMonth(due.getMonth() + i);
        const amount =
            i === safeInstallments
                ? Math.round((total - baseAmount * (safeInstallments - 1)) * 100) / 100
                : baseAmount;

        schedule.push({
            installmentNumber: i,
            dueDate: due.toLocaleDateString('es-MX', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            }),
            amount,
            paid: false,
        });
    }
    return schedule;
};

export const normalizeMerchOrder = (raw: Partial<MerchOrderRecord> & { orderId: string }): MerchOrderRecord => {
    const installments = typeof raw.installments === 'number' && raw.installments > 1 ? raw.installments : 1;
    const paymentPlanType: PaymentPlanType =
        raw.paymentPlanType ?? (installments > 1 ? 'CREDITO' : 'CONTADO');
    const total = typeof raw.total === 'number' && Number.isFinite(raw.total) ? raw.total : 0;

    const installmentSchedule =
        paymentPlanType === 'CREDITO'
            ? Array.isArray(raw.installmentSchedule) && raw.installmentSchedule.length > 0
                ? raw.installmentSchedule
                : buildInstallmentSchedule(total, installments)
            : [];

    const allCreditPaid =
        paymentPlanType === 'CREDITO' &&
        installmentSchedule.length > 0 &&
        installmentSchedule.every((inst) => inst.paid);

    const status: 'PAGADO' | 'PENDIENTE_PAGO' =
        paymentPlanType === 'CREDITO'
            ? allCreditPaid
                ? 'PAGADO'
                : 'PENDIENTE_PAGO'
            : raw.status ?? 'PAGADO';

    return {
        orderId: raw.orderId,
        authCode: raw.authCode ?? 'AUTH-000000',
        createdAt: raw.createdAt ?? '',
        createdAtTimestamp:
            typeof raw.createdAtTimestamp === 'number' && Number.isFinite(raw.createdAtTimestamp)
                ? raw.createdAtTimestamp
                : Date.now(),
        customerName: raw.customerName ?? 'Cliente',
        customerEmail: raw.customerEmail ?? '',
        customerPhone: raw.customerPhone ?? '',
        deliveryMethod: raw.deliveryMethod ?? 'SHIPPING',
        shippingAddress: raw.shippingAddress ?? '',
        paymentMethod: raw.paymentMethod ?? 'CARD',
        paymentPlanType,
        paymentSummary: raw.paymentSummary ?? '',
        installments,
        installmentSchedule,
        couponCode: raw.couponCode,
        subtotal: typeof raw.subtotal === 'number' ? raw.subtotal : total,
        discount: typeof raw.discount === 'number' ? raw.discount : 0,
        shippingCost: typeof raw.shippingCost === 'number' ? raw.shippingCost : 0,
        total,
        status,
        items: Array.isArray(raw.items) ? raw.items : [],
    };
};

export interface OrderCreditSummary {
    paidCount: number;
    totalCount: number;
    paidAmount: number;
    remainingAmount: number;
    debtStatus: CreditDebtStatus;
    statusLabel: string;
    badgeClassName: string;
    barClassName: string;
}

export const getOrderCreditSummary = (order: MerchOrderRecord): OrderCreditSummary => {
    const schedule = order.installmentSchedule ?? [];
    const totalCount = schedule.length || order.installments || 1;
    const paidInstallments = schedule.filter((item) => item.paid);
    const paidCount = paidInstallments.length;
    const paidAmount = Math.round(paidInstallments.reduce((acc, item) => acc + item.amount, 0) * 100) / 100;
    const remainingAmount = Math.max(0, Math.round((order.total - paidAmount) * 100) / 100);

    if (paidCount === 0) {
        return {
            paidCount,
            totalCount,
            paidAmount: 0,
            remainingAmount: order.total,
            debtStatus: 'DEBT_ALL',
            statusLabel: `ADEUDO TOTAL · SE DEBE TODO (0/${totalCount} PAGOS)`,
            badgeClassName: 'border-red-600/70 bg-red-950/70 text-red-300',
            barClassName: 'bg-red-500',
        };
    }

    if (paidCount >= totalCount) {
        return {
            paidCount: totalCount,
            totalCount,
            paidAmount: order.total,
            remainingAmount: 0,
            debtStatus: 'LIQUIDATED',
            statusLabel: `CRÉDITO LIQUIDADO · 100% PAGADO (${totalCount}/${totalCount} PAGOS)`,
            badgeClassName: 'border-emerald-600/70 bg-emerald-950/70 text-emerald-300',
            barClassName: 'bg-emerald-400',
        };
    }

    return {
        paidCount,
        totalCount,
        paidAmount,
        remainingAmount,
        debtStatus: 'PARTIAL',
        statusLabel: `EN CURSO · ${paidCount}/${totalCount} PAGOS ABONADOS`,
        badgeClassName: 'border-amber-500/70 bg-amber-950/70 text-amber-300',
        barClassName: 'bg-amber-400',
    };
};

export const readStoredMerchOrders = (): MerchOrderRecord[] => {
    if (typeof window === 'undefined') return [];
    try {
        const raw = window.localStorage.getItem(MERCH_ORDERS_STORAGE_KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.map((item) => normalizeMerchOrder(item as MerchOrderRecord));
    } catch {
        return [];
    }
};

export const writeStoredMerchOrders = (orders: MerchOrderRecord[]): MerchOrderRecord[] => {
    const normalized = orders.map((item) => normalizeMerchOrder(item));
    if (typeof window !== 'undefined') {
        try {
            window.localStorage.setItem(MERCH_ORDERS_STORAGE_KEY, JSON.stringify(normalized));
        } catch (error) {
            console.error('No se pudo actualizar el listado de órdenes:', error);
        }
    }
    return normalized;
};

export const saveMerchOrder = (order: MerchOrderRecord): MerchOrderRecord[] => {
    const current = readStoredMerchOrders();
    const updated = [normalizeMerchOrder(order), ...current].slice(0, 30);
    return writeStoredMerchOrders(updated);
};
