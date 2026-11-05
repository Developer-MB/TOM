import { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  Minus,
  PackageSearch,
  Plus,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  X,
} from 'lucide-react';
import type { CmsMerchProduct, MerchCategory } from '../../data/CmsTypes';
import { MERCH_CATEGORIES } from '../../data/CmsTypes';
import { ASSETS } from '../../data/Assets';
import {
  getStockBadgeInfo,
  LOW_STOCK_THRESHOLD,
  readStoredMerchCart,
  writeStoredMerchCart,
} from '../../data/Merch';

interface MerchCatalogProps {
  products: CmsMerchProduct[];
  onUpdateProducts?: (products: CmsMerchProduct[]) => void;
}

const categoryLabels: Record<MerchCategory, string> = {
  PLAYERAS: 'Playeras',
  VASOS: 'Vasos',
  TARROS: 'Tarros',
  GORRAS: 'Gorras',
  LLAVEROS: 'Llaveros',
  MOUSEPADS: 'Mousepads',
  OTROS: 'Otros',
};

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);

const MerchCatalog = ({ products, onUpdateProducts }: MerchCatalogProps) => {
  const [selectedCategory, setSelectedCategory] = useState<MerchCategory | 'TODOS'>('TODOS');
  const [cart, setCart] = useState<Record<string, number>>(() => readStoredMerchCart());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);

  useEffect(() => {
    writeStoredMerchCart(cart);
  }, [cart]);

  // Keep cart quantities clamped to current product stock if edited from CMS
  useEffect(() => {
    setCart((currentCart) => {
      let changed = false;
      const nextCart: Record<string, number> = {};
      for (const [productId, qty] of Object.entries(currentCart)) {
        const product = products.find((item) => item.id === productId && item.status === 'PUBLICADO');
        if (!product || product.stock <= 0) {
          changed = true;
          continue;
        }
        const clamped = Math.min(qty, product.stock);
        if (clamped !== qty) changed = true;
        if (clamped > 0) nextCart[productId] = clamped;
      }
      return changed ? nextCart : currentCart;
    });
  }, [products]);

  const publishedProducts = useMemo(
    () => products.filter((product) => product.status === 'PUBLICADO'),
    [products],
  );

  const visibleProducts = useMemo(
    () => publishedProducts.filter(
      (product) => selectedCategory === 'TODOS' || product.category === selectedCategory,
    ),
    [publishedProducts, selectedCategory],
  );

  const getAvailableStock = (product: CmsMerchProduct): number => {
    const inCart = cart[product.id] ?? 0;
    return Math.max(0, (product.stock ?? 0) - inCart);
  };

  const stockSummary = useMemo(() => {
    let available = 0;
    let low = 0;
    let out = 0;
    for (const product of publishedProducts) {
      const remaining = Math.max(0, (product.stock ?? 0) - (cart[product.id] ?? 0));
      if (remaining === 0) out += 1;
      else if (remaining <= LOW_STOCK_THRESHOLD) low += 1;
      else available += 1;
    }
    return { available, low, out };
  }, [publishedProducts, cart]);

  const cartDetailedItems = useMemo(() => {
    return Object.entries(cart)
      .map(([productId, quantity]) => {
        const product = publishedProducts.find((item) => item.id === productId);
        if (!product || quantity <= 0) return null;
        return {
          product,
          quantity,
          subtotal: product.price * quantity,
          remainingStock: Math.max(0, product.stock - quantity),
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);
  }, [cart, publishedProducts]);

  const totalItemsInCart = useMemo(
    () => cartDetailedItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartDetailedItems],
  );

  const totalCartPrice = useMemo(
    () => cartDetailedItems.reduce((sum, item) => sum + item.subtotal, 0),
    [cartDetailedItems],
  );

  const handleAddToCart = (product: CmsMerchProduct) => {
    setCheckoutSuccess(null);
    setCart((current) => {
      const currentQty = current[product.id] ?? 0;
      if (currentQty >= product.stock) return current;
      return {
        ...current,
        [product.id]: currentQty + 1,
      };
    });
  };

  const handleDecrementFromCart = (productId: string) => {
    setCart((current) => {
      const currentQty = current[productId] ?? 0;
      if (currentQty <= 1) {
        const { [productId]: _removed, ...rest } = current;
        return rest;
      }
      return {
        ...current,
        [productId]: currentQty - 1,
      };
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart((current) => {
      const { [productId]: _removed, ...rest } = current;
      return rest;
    });
  };

  const handleClearCart = () => {
    setCart({});
  };

  const handleConfirmPurchase = () => {
    if (cartDetailedItems.length === 0) return;

    const purchasedCount = totalItemsInCart;
    const purchasedTotal = totalCartPrice;

    const updatedProducts = products.map((product) => {
      const qtyInCart = cart[product.id] ?? 0;
      if (qtyInCart <= 0) return product;
      return {
        ...product,
        stock: Math.max(0, (product.stock ?? 0) - qtyInCart),
      };
    });

    onUpdateProducts?.(updatedProducts);
    setCart({});
    setCheckoutSuccess(
      `¡Compra confirmada! Se descontaron ${purchasedCount} ${purchasedCount === 1 ? 'artículo' : 'artículos'} del inventario por un total de ${formatPrice(purchasedTotal)}.`,
    );
  };

  return (
    <div className="min-h-screen bg-black text-[#F4F4F6]">
      <section className="mx-auto max-w-[1440px] px-4 pb-8 pt-12 lg:px-8">
        <div className="flex flex-col justify-between gap-6 border-b border-zinc-800 pb-8 lg:flex-row lg:items-end">
          <div>
            <img
              src={ASSETS.logoMerch}
              alt="Time of Metal Merch"
              className="h-auto w-full max-w-[320px] object-contain sm:max-w-[400px]"
            />
            <p className="mt-3 max-w-2xl text-sm text-zinc-400">
              Equípate para el próximo moshpit. Explora playeras, vasos, gorras y más con control de inventario en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Semáforo de inventario global */}
            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-wider">
              <span className="inline-flex items-center gap-1.5 border border-emerald-700/50 bg-emerald-950/60 px-2.5 py-1.5 text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                En existencia: {stockSummary.available}
              </span>
              <span className="inline-flex items-center gap-1.5 border border-amber-600/50 bg-amber-950/60 px-2.5 py-1.5 text-amber-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                Pocas unidades: {stockSummary.low}
              </span>
              <span className="inline-flex items-center gap-1.5 border border-red-700/50 bg-red-950/60 px-2.5 py-1.5 text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                Agotados: {stockSummary.out}
              </span>
            </div>

            {/* Botón del carrito de compras */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative flex cursor-pointer items-center gap-3 border border-[#DC2626] bg-[#14090B] px-4 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#DC2626]"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Carrito ({totalItemsInCart})</span>
              {totalItemsInCart > 0 && (
                <span className="border-l border-white/20 pl-2.5 text-[11px] text-zinc-200">
                  {formatPrice(totalCartPrice)}
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-16 lg:px-8">
        {checkoutSuccess && (
          <div
            role="status"
            className="mb-6 flex items-center justify-between gap-4 border border-emerald-700/60 bg-emerald-950/40 px-4 py-3 font-mono text-xs text-emerald-300"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              {checkoutSuccess}
            </span>
            <button
              type="button"
              onClick={() => setCheckoutSuccess(null)}
              className="cursor-pointer text-emerald-400 hover:text-white"
              aria-label="Cerrar aviso"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2" aria-label="Filtrar por categoría">
            <button
              type="button"
              onClick={() => setSelectedCategory('TODOS')}
              aria-pressed={selectedCategory === 'TODOS'}
              className={`cursor-pointer border px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                selectedCategory === 'TODOS'
                  ? 'border-[#DC2626] bg-[#DC2626] text-white'
                  : 'border-zinc-800 bg-[#0E0E12] text-zinc-400 hover:border-zinc-600 hover:text-white'
              }`}
            >
              Todo ({publishedProducts.length})
            </button>
            {MERCH_CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                aria-pressed={selectedCategory === category}
                className={`cursor-pointer border px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                  selectedCategory === category
                    ? 'border-[#DC2626] bg-[#DC2626] text-white'
                    : 'border-zinc-800 bg-[#0E0E12] text-zinc-400 hover:border-zinc-600 hover:text-white'
                }`}
              >
                {categoryLabels[category]}
              </button>
            ))}
          </div>

          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
            Mostrando {visibleProducts.length} {visibleProducts.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>

        {visibleProducts.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => {
              const inCartQty = cart[product.id] ?? 0;
              const availableStock = getAvailableStock(product);
              const stockBadge = getStockBadgeInfo(availableStock);
              const isOutOfStock = availableStock === 0;

              return (
                <article
                  key={product.id}
                  className="group flex flex-col justify-between overflow-hidden border border-zinc-800 bg-[#0E0E12] transition-colors hover:border-zinc-600"
                >
                  <div>
                    <div className="relative aspect-square overflow-hidden bg-[#070709]">
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                        className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                          isOutOfStock ? 'opacity-45 grayscale' : ''
                        }`}
                      />
                      {/* Aviso de inventario con código de color */}
                      <div className="absolute left-3 top-3 right-3 flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-wider shadow-md backdrop-blur-sm ${stockBadge.badgeClassName}`}
                        >
                          <span className={`h-2 w-2 rounded-full ${stockBadge.dotClassName}`} />
                          {stockBadge.label}
                        </span>
                      </div>

                      {inCartQty > 0 && (
                        <div className="absolute bottom-3 right-3 border border-[#DC2626] bg-black/90 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-white">
                          En carrito: {inCartQty}
                        </div>
                      )}
                    </div>

                    <div className="p-5 pb-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#DC2626]">
                          {categoryLabels[product.category]}
                        </p>
                        <span className="font-mono text-[10px] text-zinc-500">{product.code}</span>
                      </div>
                      <h2 className="mt-2 font-display text-lg font-bold uppercase text-white">
                        {product.name}
                      </h2>
                      {product.description && (
                        <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-sm leading-relaxed text-zinc-400">
                          {product.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="p-5 pt-0">
                    <div className="flex flex-col gap-3 border-t border-zinc-800 pt-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-lg font-bold text-white">
                          {formatPrice(product.price)}
                        </span>
                        <span className="font-mono text-[10px] text-zinc-400">
                          Stock total: {product.stock}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {inCartQty > 0 ? (
                          <div className="flex flex-1 items-center justify-between border border-zinc-700 bg-[#070709]">
                            <button
                              type="button"
                              onClick={() => handleDecrementFromCart(product.id)}
                              className="cursor-pointer px-3 py-2 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
                              aria-label={`Quitar una unidad de ${product.name}`}
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="font-mono text-xs font-bold text-white">
                              {inCartQty} en carrito
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product)}
                              disabled={isOutOfStock}
                              className="cursor-pointer px-3 py-2 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label={`Agregar otra unidad de ${product.name}`}
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            disabled={isOutOfStock}
                            className={`flex flex-1 cursor-pointer items-center justify-center gap-2 px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider transition-colors ${
                              isOutOfStock
                                ? 'cursor-not-allowed border border-red-900/50 bg-red-950/30 text-red-400/70'
                                : 'bg-[#DC2626] text-white hover:bg-red-700'
                            }`}
                          >
                            <ShoppingCart className="h-3.5 w-3.5" />
                            {isOutOfStock ? 'Producto agotado' : 'Agregar al carrito'}
                          </button>
                        )}

                        {product.purchaseUrl && (
                          <a
                            href={product.purchaseUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Enlace externo de compra"
                            className="inline-flex items-center justify-center border border-zinc-700 bg-[#070709] p-2.5 text-zinc-300 transition-colors hover:border-[#DC2626] hover:text-white"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="border border-dashed border-zinc-800 bg-[#0E0E12] px-6 py-16 text-center">
            <PackageSearch className="mx-auto h-10 w-10 text-zinc-600" />
            <h2 className="mt-4 font-display text-xl font-bold uppercase text-white">Aún no hay productos</h2>
            <p className="mt-2 text-sm text-zinc-500">
              {selectedCategory === 'TODOS'
                ? 'Estamos preparando mercancía nueva. Vuelve pronto.'
                : `Todavía no hay productos publicados en ${categoryLabels[selectedCategory]}.`}
            </p>
          </div>
        )}
      </section>

      {/* PANEL DESLIZANTE DEL CARRITO DE COMPRAS */}
      {isCartOpen && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label="Carrito de compras de mercancía"
        >
          <div className="flex h-full w-full max-w-lg flex-col border-l border-zinc-800 bg-[#0E0E12] text-[#F4F4F6] shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-5">
              <div className="flex items-center gap-3">
                <ShoppingBag className="h-5 w-5 text-[#DC2626]" />
                <div>
                  <h2 className="font-display text-xl font-black uppercase text-white">
                    Carrito de Compra
                  </h2>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                    {totalItemsInCart} {totalItemsInCart === 1 ? 'unidad reservada' : 'unidades reservadas'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCartOpen(false)}
                className="cursor-pointer border border-zinc-800 p-2 text-zinc-400 hover:border-zinc-600 hover:text-white"
                aria-label="Cerrar carrito"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {cartDetailedItems.length ? (
                cartDetailedItems.map(({ product, quantity, subtotal, remainingStock }) => {
                  const badge = getStockBadgeInfo(remainingStock);
                  return (
                    <div
                      key={product.id}
                      className="flex gap-4 border border-zinc-800 bg-[#070709] p-4"
                    >
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-20 w-20 shrink-0 border border-zinc-800 object-cover"
                      />
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-display text-sm font-bold uppercase text-white">
                              {product.name}
                            </h3>
                            <p className="font-mono text-[10px] text-zinc-500">
                              {formatPrice(product.price)} c/u
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(product.id)}
                            className="cursor-pointer p-1 text-zinc-500 hover:text-[#DC2626]"
                            title="Eliminar del carrito"
                            aria-label={`Eliminar ${product.name} del carrito`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        <div>
                          <span
                            className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${badge.badgeClassName}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${badge.dotClassName}`} />
                            {badge.label}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="inline-flex items-center border border-zinc-700 bg-[#0E0E12]">
                            <button
                              type="button"
                              onClick={() => handleDecrementFromCart(product.id)}
                              className="cursor-pointer px-2.5 py-1 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                              aria-label="Disminuir cantidad"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-3 font-mono text-xs font-bold text-white">
                              {quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product)}
                              disabled={remainingStock === 0}
                              className="cursor-pointer px-2.5 py-1 text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                              aria-label="Aumentar cantidad"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <span className="font-mono text-sm font-bold text-white">
                            {formatPrice(subtotal)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex h-64 flex-col items-center justify-center border border-dashed border-zinc-800 text-center">
                  <ShoppingCart className="mb-3 h-8 w-8 text-zinc-600" />
                  <p className="font-display text-base font-bold uppercase text-white">
                    Tu carrito está vacío
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-zinc-500">
                    Selecciona productos del catálogo para agregarlos y verificar existencias en tiempo real.
                  </p>
                </div>
              )}
            </div>

            {cartDetailedItems.length > 0 && (
              <div className="space-y-4 border-t border-zinc-800 bg-[#09090C] p-6">
                <div className="space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>UNIDADES EN CARRITO:</span>
                    <span>{totalItemsInCart}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white">
                    <span>TOTAL A PAGAR:</span>
                    <span className="text-[#DC2626]">{formatPrice(totalCartPrice)}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleClearCart}
                    className="cursor-pointer border border-zinc-700 px-4 py-3 font-mono text-xs font-bold uppercase tracking-wider text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
                  >
                    Vaciar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmPurchase}
                    className="flex-1 cursor-pointer bg-[#DC2626] px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-700"
                  >
                    Confirmar compra
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MerchCatalog;
