import initialMerch from '../../data/post-merch.json';
import type { CmsMerchProduct } from './CmsTypes';

export const LOW_STOCK_THRESHOLD = 5;
export const MERCH_STORAGE_KEY = 'tom_cms_merch_catalog_v1';
export const MERCH_CART_STORAGE_KEY = 'tom_merch_cart_v1';
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
