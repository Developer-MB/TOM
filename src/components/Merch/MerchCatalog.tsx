import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Eye,
  Filter,
  Minus,
  PackageSearch,
  Plus,
  Printer,
  Receipt,
  Search,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Wallet,
  X,
} from 'lucide-react';
import type { CmsMerchProduct, MerchCategory } from '../../data/CmsTypes';
import { MERCH_CATEGORIES } from '../../data/CmsTypes';
import { ASSETS } from '../../data/Assets';
import {
  getOrderCreditSummary,
  getStockBadgeInfo,
  LOW_STOCK_THRESHOLD,
  readStoredMerchCart,
  readStoredMerchOrders,
  saveMerchOrder,
  writeStoredMerchCart,
  writeStoredMerchOrders,
  type MerchOrderRecord,
} from '../../data/Merch';
import MerchPaymentGatewayModal from './MerchPaymentGatewayModal';

interface MerchCatalogProps {
  products: CmsMerchProduct[];
  onUpdateProducts?: (products: CmsMerchProduct[]) => void;
}

type MerchViewMode = 'CATALOG' | 'ORDERS';
type OrdersPlanFilter = 'ALL' | 'CONTADO' | 'CREDITO' | 'DEBT_ALL' | 'LIQUIDATED';
type OrdersSortOption = 'DATE_DESC' | 'DATE_ASC' | 'TOTAL_DESC' | 'TOTAL_ASC' | 'FOLIO_ASC';

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
  const [activeView, setActiveView] = useState<MerchViewMode>('CATALOG');
  const [selectedCategory, setSelectedCategory] = useState<MerchCategory | 'TODOS'>('TODOS');
  const [cart, setCart] = useState<Record<string, number>>(() => readStoredMerchCart());
  const [orders, setOrders] = useState<MerchOrderRecord[]>(() => readStoredMerchOrders());
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState<string | null>(null);

  // Filters & Modal state for "Mis Pedidos" view
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [orderPlanFilter, setOrderPlanFilter] = useState<OrdersPlanFilter>('ALL');
  const [orderSortBy, setOrderSortBy] = useState<OrdersSortOption>('DATE_DESC');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

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
    () =>
      publishedProducts.filter(
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

  const isCartEmpty = totalItemsInCart === 0;
  const isOrdersEmpty = orders.length === 0;

  // Filtered and sorted orders for the 2-column "Mis Pedidos" screen
  const filteredAndSortedOrders = useMemo(() => {
    const query = orderSearchQuery.trim().toLowerCase();

    const filtered = orders.filter((ord) => {
      if (orderPlanFilter === 'CONTADO' && ord.paymentPlanType !== 'CONTADO') return false;
      if (orderPlanFilter === 'CREDITO' && ord.paymentPlanType !== 'CREDITO') return false;
      if (orderPlanFilter === 'DEBT_ALL') {
        if (ord.paymentPlanType !== 'CREDITO') return false;
        const summary = getOrderCreditSummary(ord);
        if (summary.debtStatus !== 'DEBT_ALL') return false;
      }
      if (orderPlanFilter === 'LIQUIDATED') {
        if (ord.paymentPlanType === 'CREDITO') {
          const summary = getOrderCreditSummary(ord);
          if (summary.debtStatus !== 'LIQUIDATED') return false;
        } else if (ord.status !== 'PAGADO') {
          return false;
        }
      }

      if (!query) return true;
      const matchesId = ord.orderId.toLowerCase().includes(query);
      const matchesAuth = ord.authCode.toLowerCase().includes(query);
      const matchesCustomer = ord.customerName.toLowerCase().includes(query);
      const matchesEmail = ord.customerEmail.toLowerCase().includes(query);
      const matchesSummary = ord.paymentSummary.toLowerCase().includes(query);
      const matchesItems = ord.items.some(
        (item) =>
          item.name.toLowerCase().includes(query) || item.code.toLowerCase().includes(query),
      );
      return (
        matchesId ||
        matchesAuth ||
        matchesCustomer ||
        matchesEmail ||
        matchesSummary ||
        matchesItems
      );
    });

    return [...filtered].sort((a, b) => {
      if (orderSortBy === 'DATE_DESC') return (b.createdAtTimestamp ?? 0) - (a.createdAtTimestamp ?? 0);
      if (orderSortBy === 'DATE_ASC') return (a.createdAtTimestamp ?? 0) - (b.createdAtTimestamp ?? 0);
      if (orderSortBy === 'TOTAL_DESC') return b.total - a.total;
      if (orderSortBy === 'TOTAL_ASC') return a.total - b.total;
      return a.orderId.localeCompare(b.orderId);
    });
  }, [orders, orderSearchQuery, orderPlanFilter, orderSortBy]);

  const selectedOrder = useMemo(
    () => orders.find((ord) => ord.orderId === selectedOrderId) ?? null,
    [orders, selectedOrderId],
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

  const handleBuyNow = (product: CmsMerchProduct) => {
    setCheckoutSuccess(null);
    setCart((current) => {
      const currentQty = current[product.id] ?? 0;
      const nextQty = currentQty > 0 ? currentQty : Math.min(1, product.stock);
      if (nextQty <= 0) return current;
      return {
        ...current,
        [product.id]: nextQty,
      };
    });
    setIsCartOpen(false);
    setIsPaymentModalOpen(true);
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

  const handleProceedToPaymentGateway = () => {
    if (cartDetailedItems.length === 0) return;
    setIsCartOpen(false);
    setIsPaymentModalOpen(true);
  };

  const handleOrderCompleted = (order: MerchOrderRecord) => {
    const updatedProducts = products.map((product) => {
      const qtyInCart = cart[product.id] ?? 0;
      if (qtyInCart <= 0) return product;
      return {
        ...product,
        stock: Math.max(0, (product.stock ?? 0) - qtyInCart),
      };
    });

    onUpdateProducts?.(updatedProducts);
    const updatedOrders = saveMerchOrder(order);
    setOrders(updatedOrders);
    setCart({});
    setCheckoutSuccess(
      `¡Pedido registrado! Orden ${order.orderId} (${
        order.paymentPlanType === 'CREDITO'
          ? `Crédito a ${order.installments} pagos`
          : 'Pago de Contado'
      }) por ${formatPrice(order.total)}. Puedes consultarla en "Mis Pedidos".`,
    );
  };

  // Toggle individual installment payment in a Credit order
  const handleToggleInstallmentPayment = (orderId: string, installmentNumber: number) => {
    const nowFormatted = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const nextOrders = orders.map((ord) => {
      if (ord.orderId !== orderId || ord.paymentPlanType !== 'CREDITO') return ord;
      const updatedSchedule = ord.installmentSchedule.map((inst) => {
        if (inst.installmentNumber !== installmentNumber) return inst;
        const nextPaid = !inst.paid;
        return {
          ...inst,
          paid: nextPaid,
          paidAt: nextPaid ? nowFormatted : undefined,
        };
      });
      const allPaid = updatedSchedule.every((inst) => inst.paid);
      return {
        ...ord,
        installmentSchedule: updatedSchedule,
        status: (allPaid ? 'PAGADO' : 'PENDIENTE_PAGO') as 'PAGADO' | 'PENDIENTE_PAGO',
      };
    });

    const persisted = writeStoredMerchOrders(nextOrders);
    setOrders(persisted);
  };

  // Mark all installments as paid or unpaid at once for quick testing
  const handleSetAllInstallments = (orderId: string, markPaid: boolean) => {
    const nowFormatted = new Date().toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

    const nextOrders = orders.map((ord) => {
      if (ord.orderId !== orderId || ord.paymentPlanType !== 'CREDITO') return ord;
      const updatedSchedule = ord.installmentSchedule.map((inst) => ({
        ...inst,
        paid: markPaid,
        paidAt: markPaid ? inst.paidAt ?? nowFormatted : undefined,
      }));
      return {
        ...ord,
        installmentSchedule: updatedSchedule,
        status: (markPaid ? 'PAGADO' : 'PENDIENTE_PAGO') as 'PAGADO' | 'PENDIENTE_PAGO',
      };
    });

    const persisted = writeStoredMerchOrders(nextOrders);
    setOrders(persisted);
  };

  return (
    <div className="min-h-screen bg-black text-[#F4F4F6]">
      {/* CABECERA PRINCIPAL CON SEMÁFORO EN FILA 1 Y BOTONES EN FILA 2 */}
      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pb-8 pt-6 sm:pt-10">
        <div className="flex flex-col justify-between gap-6 border-b border-zinc-800 pb-8 lg:flex-row lg:items-end">
          <div>
            <img
              src={ASSETS.logoMerch}
              alt="Time of Metal Merch"
              className="h-auto w-full max-w-[260px] object-contain sm:max-w-[360px]"
            />
            <p className="mt-3 max-w-2xl text-sm text-zinc-400">
              Equípate para el próximo moshpit. Explora playeras, vasos, gorras y más con control de inventario en tiempo real y pasarela de pago a contado o crédito.
            </p>
          </div>

          {/* CONTENEDOR DE DOS FILAS ALINEADAS: FILA 1 SEMÁFORO, FILA 2 BOTONES */}
          <div className="flex flex-col items-stretch gap-2.5 lg:items-end">
            {/* FILA 1: Semáforo de inventario global alineado en una sola línea */}
            <div className="flex flex-nowrap items-center justify-between gap-2 overflow-x-auto font-mono text-[10px] uppercase tracking-wider">
              <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border border-emerald-700/50 bg-emerald-950/60 px-2.5 py-1.5 text-emerald-400">
                <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                En existencia: {stockSummary.available}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border border-amber-600/50 bg-amber-950/60 px-2.5 py-1.5 text-amber-400">
                <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-400" />
                Pocas unidades: {stockSummary.low}
              </span>
              <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap border border-red-700/50 bg-red-950/60 px-2.5 py-1.5 text-red-400">
                <span className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                Agotados: {stockSummary.out}
              </span>
            </div>

            {/* FILA 2: Botones de Carrito y Mis Pedidos alineados con el semáforo superior */}
            <div className="grid w-full grid-cols-2 gap-2">
              {/* Botón de Carrito (Inactivo si está vacío, activo cuando tiene productos) */}
              <button
                type="button"
                disabled={isCartEmpty}
                onClick={() => {
                  if (!isCartEmpty) setIsCartOpen(true);
                }}
                title={
                  isCartEmpty
                    ? 'El carrito está vacío — agrega productos para activarlo'
                    : 'Ver contenido del carrito de compras'
                }
                className={`flex items-center justify-center gap-2 border px-3.5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                  isCartEmpty
                    ? 'cursor-not-allowed border-zinc-800 bg-zinc-900/40 text-zinc-600 opacity-60'
                    : 'cursor-pointer border-[#DC2626] bg-[#14090B] text-white hover:bg-[#DC2626]'
                }`}
              >
                <ShoppingCart className="h-4 w-4 shrink-0" />
                <span className="truncate">Carrito ({totalItemsInCart})</span>
                {!isCartEmpty && (
                  <span className="hidden border-l border-white/20 pl-2 text-[11px] text-zinc-200 sm:inline">
                    {formatPrice(totalCartPrice)}
                  </span>
                )}
              </button>

              {/* Botón de Mis Pedidos (Inactivo si no hay pedidos, activo cuando existe al menos 1) */}
              <button
                type="button"
                disabled={isOrdersEmpty}
                onClick={() => {
                  if (!isOrdersEmpty) setActiveView('ORDERS');
                }}
                title={
                  isOrdersEmpty
                    ? 'Aún no tienes pedidos registrados'
                    : 'Ver listado completo de Mis Pedidos'
                }
                className={`flex items-center justify-center gap-2 border px-3.5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider transition-colors ${
                  isOrdersEmpty
                    ? 'cursor-not-allowed border-zinc-800 bg-zinc-900/40 text-zinc-600 opacity-60'
                    : activeView === 'ORDERS'
                      ? 'cursor-pointer border-[#DC2626] bg-[#DC2626] text-white'
                      : 'cursor-pointer border-amber-500/70 bg-[#141008] text-amber-300 hover:border-amber-400 hover:bg-amber-500/20 hover:text-white'
                }`}
              >
                <Receipt className="h-4 w-4 shrink-0" />
                <span className="truncate">Mis Pedidos ({orders.length})</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 pb-16">
        {checkoutSuccess && (
          <div
            role="status"
            className="mb-6 flex flex-wrap items-center justify-between gap-4 border border-emerald-700/60 bg-emerald-950/40 px-4 py-3 font-mono text-xs text-emerald-300"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              {checkoutSuccess}
            </span>
            <div className="flex items-center gap-3">
              {activeView !== 'ORDERS' && orders.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveView('ORDERS')}
                  className="cursor-pointer border border-emerald-500/60 bg-emerald-900/40 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-white hover:bg-emerald-700"
                >
                  Ir a Mis Pedidos
                </button>
              )}
              <button
                type="button"
                onClick={() => setCheckoutSuccess(null)}
                className="cursor-pointer text-emerald-400 hover:text-white"
                aria-label="Cerrar aviso"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            VISTA EXCLUSIVA 1: MIS PEDIDOS (DOS COLUMNAS, FILTROS Y BÚSQUEDA)
           ===================================================================== */}
        {activeView === 'ORDERS' ? (
          <div className="space-y-6">
            {/* Barra superior con enlace de retorno a Merch y resumen de estados */}
            <div className="flex flex-col justify-between gap-4 border border-zinc-800 bg-[#0E0E12] p-5 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                  <button
                    type="button"
                    onClick={() => setActiveView('CATALOG')}
                    className="cursor-pointer text-[#DC2626] underline-offset-4 hover:underline font-bold"
                  >
                    Catálogo de Merch
                  </button>
                  <span>/</span>
                  <span className="text-white">Mis Pedidos</span>
                </div>
                <h2 className="font-display text-2xl font-black uppercase text-white flex items-center gap-2.5">
                  <Receipt className="h-6 w-6 text-[#DC2626]" />
                  Historial y Control de Mis Pedidos ({orders.length})
                </h2>
                <p className="font-mono text-xs text-zinc-400">
                  Diferenciación por color para compras de <strong className="text-cyan-300">Contado</strong> y{' '}
                  <strong className="text-purple-300">Crédito</strong>. Selecciona cualquier orden para abrir su ticket detallado.
                </p>
              </div>

              {/* Enlace directo para regresar de la vista Mis Pedidos a Merch */}
              <a
                href="#merch-catalog"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveView('CATALOG');
                }}
                className="inline-flex shrink-0 items-center justify-center gap-2 border border-[#DC2626] bg-[#14090B] px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#DC2626]"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver a la Tienda de Merch
              </a>
            </div>

            {/* Leyenda de colores y filtros de búsqueda y ordenamiento */}
            <div className="space-y-4 border border-zinc-800 bg-[#0A0A0E] p-5">
              {/* Leyenda visual de códigos de color */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/80 pb-4 font-mono text-[10px] uppercase">
                <span className="text-zinc-400 font-bold">Código de Colores de Pedidos:</span>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 border border-cyan-500/60 bg-cyan-950/50 px-2.5 py-1 text-cyan-300">
                    <span className="h-2 w-2 rounded-full bg-cyan-400" />
                    Pago de Contado
                  </span>
                  <span className="inline-flex items-center gap-1.5 border border-purple-500/60 bg-purple-950/50 px-2.5 py-1 text-purple-300">
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                    Compra a Crédito
                  </span>
                  <span className="inline-flex items-center gap-1.5 border border-red-600/70 bg-red-950/60 px-2.5 py-1 text-red-300">
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                    Se Debe Todo (Adeudo Total)
                  </span>
                  <span className="inline-flex items-center gap-1.5 border border-amber-500/70 bg-amber-950/60 px-2.5 py-1 text-amber-300">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Pagos en Curso
                  </span>
                  <span className="inline-flex items-center gap-1.5 border border-emerald-600/70 bg-emerald-950/60 px-2.5 py-1 text-emerald-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    Pago Liquidado (100%)
                  </span>
                </div>
              </div>

              {/* Controles de Búsqueda, Filtro por Modalidad y Ordenamiento */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
                {/* Buscador */}
                <div className="relative md:col-span-5">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="search"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Buscar por folio, cliente, correo o producto..."
                    className="w-full border border-zinc-800 bg-[#070709] py-2.5 pl-10 pr-4 font-mono text-xs text-white outline-none transition-colors focus:border-[#DC2626]"
                  />
                </div>

                {/* Filtro por tipo de pago / estado de deuda */}
                <div className="flex items-center gap-2 md:col-span-4">
                  <Filter className="h-4 w-4 shrink-0 text-[#DC2626]" />
                  <select
                    value={orderPlanFilter}
                    onChange={(e) => setOrderPlanFilter(e.target.value as OrdersPlanFilter)}
                    aria-label="Filtrar pedidos por modalidad o estado"
                    className="w-full border border-zinc-800 bg-[#070709] px-3 py-2.5 font-mono text-xs text-white outline-none transition-colors focus:border-[#DC2626]"
                  >
                    <option value="ALL">Todos los pedidos ({orders.length})</option>
                    <option value="CONTADO">Solo Contado</option>
                    <option value="CREDITO">Solo Crédito (MSI)</option>
                    <option value="DEBT_ALL">Adeudo Total (Se debe todo)</option>
                    <option value="LIQUIDATED">Liquidados (100% pagados)</option>
                  </select>
                </div>

                {/* Ordenamiento */}
                <div className="flex items-center gap-2 md:col-span-3">
                  <ArrowUpDown className="h-4 w-4 shrink-0 text-[#DC2626]" />
                  <select
                    value={orderSortBy}
                    onChange={(e) => setOrderSortBy(e.target.value as OrdersSortOption)}
                    aria-label="Ordenar pedidos"
                    className="w-full border border-zinc-800 bg-[#070709] px-3 py-2.5 font-mono text-xs text-white outline-none transition-colors focus:border-[#DC2626]"
                  >
                    <option value="DATE_DESC">Más recientes primero</option>
                    <option value="DATE_ASC">Más antiguos primero</option>
                    <option value="TOTAL_DESC">Mayor importe total</option>
                    <option value="TOTAL_ASC">Menor importe total</option>
                    <option value="FOLIO_ASC">Folio (A - Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* LISTADO DE PEDIDOS EN DOS COLUMNAS */}
            {filteredAndSortedOrders.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {filteredAndSortedOrders.map((ord) => {
                  const isCredit = ord.paymentPlanType === 'CREDITO';
                  const creditSummary = isCredit ? getOrderCreditSummary(ord) : null;
                  const totalUnits = ord.items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <article
                      key={ord.orderId}
                      className={`flex flex-col justify-between border bg-[#0E0E12] transition-colors ${
                        isCredit
                          ? 'border-zinc-800 border-l-4 border-l-purple-500 hover:border-purple-500/60'
                          : 'border-zinc-800 border-l-4 border-l-cyan-500 hover:border-cyan-500/60'
                      }`}
                    >
                      <div className="p-5 space-y-4">
                        {/* Encabezado de la tarjeta del pedido */}
                        <div className="flex flex-wrap items-start justify-between gap-2 border-b border-zinc-800 pb-3">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedOrderId(ord.orderId)}
                                className="cursor-pointer font-mono text-sm font-bold text-white hover:text-[#DC2626] underline-offset-4 hover:underline"
                              >
                                {ord.orderId}
                              </button>
                              <span className="font-mono text-[10px] text-zinc-500">
                                {ord.authCode}
                              </span>
                            </div>
                            <p className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-zinc-400">
                              <Calendar className="h-3 w-3 text-zinc-500" />
                              {ord.createdAt} · Cliente:{' '}
                              <strong className="text-zinc-200">{ord.customerName}</strong>
                            </p>
                          </div>

                          {/* Etiqueta de color: CONTADO vs CRÉDITO */}
                          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[10px] font-bold uppercase">
                            {isCredit ? (
                              <span className="inline-flex items-center gap-1.5 border border-purple-500/70 bg-purple-950/70 px-2.5 py-1 text-purple-300">
                                <CreditCard className="h-3 w-3" />
                                CRÉDITO · {ord.installments} PAGOS
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 border border-cyan-500/70 bg-cyan-950/70 px-2.5 py-1 text-cyan-300">
                                <Wallet className="h-3 w-3" />
                                PAGO DE CONTADO
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Estado financiero / Color de liquidación */}
                        {isCredit && creditSummary ? (
                          <div className="space-y-3 border border-zinc-800/90 bg-[#070709] p-4 font-mono">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span
                                className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] font-bold uppercase ${creditSummary.badgeClassName}`}
                              >
                                <span
                                  className={`h-2 w-2 rounded-full ${creditSummary.barClassName}`}
                                />
                                {creditSummary.statusLabel}
                              </span>

                              <div className="flex items-center gap-1.5">
                                {creditSummary.debtStatus !== 'LIQUIDATED' && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetAllInstallments(ord.orderId, true)}
                                    className="cursor-pointer border border-emerald-600/60 bg-emerald-950/50 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-300 hover:bg-emerald-800/60 hover:text-white"
                                  >
                                    Liquidar Todo
                                  </button>
                                )}
                                {creditSummary.paidCount > 0 && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetAllInstallments(ord.orderId, false)}
                                    className="cursor-pointer border border-red-700/60 bg-red-950/40 px-2 py-0.5 text-[9px] font-bold uppercase text-red-300 hover:bg-red-900/60 hover:text-white"
                                  >
                                    Reiniciar Adeudo
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Barra de progreso del crédito */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="text-emerald-400">
                                  Abonado: <strong>{formatPrice(creditSummary.paidAmount)}</strong>
                                </span>
                                <span
                                  className={
                                    creditSummary.remainingAmount === 0
                                      ? 'text-emerald-400 font-bold'
                                      : creditSummary.paidCount === 0
                                        ? 'text-red-400 font-bold'
                                        : 'text-amber-300 font-bold'
                                  }
                                >
                                  Por pagar: {formatPrice(creditSummary.remainingAmount)}
                                </span>
                              </div>
                              <div className="h-2 w-full overflow-hidden bg-zinc-900 border border-zinc-800">
                                <div
                                  className={`h-full transition-all duration-300 ${creditSummary.barClassName}`}
                                  style={{
                                    width: `${Math.max(
                                      6,
                                      Math.round(
                                        (creditSummary.paidCount / creditSummary.totalCount) * 100,
                                      ),
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>

                            {/* Desglose interactivo de pagos de crédito */}
                            <div className="space-y-1.5 pt-1">
                              <div className="text-[10px] uppercase tracking-wider text-zinc-400 font-bold">
                                Desglose de Pagos Mensuales (Haz clic para actualizar cada pago):
                              </div>
                              <div className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                                {ord.installmentSchedule.map((inst) => (
                                  <div
                                    key={inst.installmentNumber}
                                    className={`flex items-center justify-between gap-2 border px-3 py-2 text-[11px] transition-colors ${
                                      inst.paid
                                        ? 'border-emerald-700/50 bg-emerald-950/25 text-emerald-200'
                                        : 'border-red-900/50 bg-red-950/20 text-zinc-200'
                                    }`}
                                  >
                                    <div className="min-w-0">
                                      <span className="font-bold text-white">
                                        Pago #{inst.installmentNumber}/{ord.installments}
                                      </span>
                                      <span className="ml-2 text-[10px] text-zinc-400">
                                        Vence: {inst.dueDate}
                                      </span>
                                      {inst.paid && inst.paidAt && (
                                        <span className="block text-[9px] text-emerald-400">
                                          Pagado el {inst.paidAt}
                                        </span>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="font-bold text-white">
                                        {formatPrice(inst.amount)}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleToggleInstallmentPayment(
                                            ord.orderId,
                                            inst.installmentNumber,
                                          )
                                        }
                                        className={`cursor-pointer border px-2.5 py-1 text-[10px] font-bold uppercase transition-colors ${
                                          inst.paid
                                            ? 'border-emerald-500 bg-emerald-600 text-black hover:bg-emerald-500'
                                            : 'border-red-500/80 bg-red-950/70 text-red-300 hover:bg-red-600 hover:text-white'
                                        }`}
                                      >
                                        {inst.paid ? '✓ Liquidado' : 'Pagar Cuota'}
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center justify-between gap-2 border border-emerald-800/50 bg-emerald-950/20 px-4 py-3 font-mono text-xs">
                            <span className="inline-flex items-center gap-2 font-bold uppercase text-emerald-300">
                              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                              PAGO DE CONTADO LIQUIDADO AL 100%
                            </span>
                            <span className="text-[11px] text-zinc-300">{ord.paymentSummary}</span>
                          </div>
                        )}
                      </div>

                      {/* Pie de tarjeta con resumen y botón para abrir el Modal del Ticket */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 bg-[#09090C] px-5 py-3.5 font-mono text-xs">
                        <div>
                          <span className="text-zinc-400">
                            {totalUnits} {totalUnits === 1 ? 'artículo' : 'artículos'} · Total:{' '}
                          </span>
                          <strong className="text-sm text-[#DC2626]">{formatPrice(ord.total)}</strong>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedOrderId(ord.orderId)}
                          className="inline-flex cursor-pointer items-center gap-1.5 border border-zinc-700 bg-[#0E0E12] px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:border-[#DC2626] hover:bg-[#DC2626]"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Ver Ticket / Contenido
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <div className="border border-dashed border-zinc-800 bg-[#0E0E12] px-6 py-16 text-center font-mono">
                <Receipt className="mx-auto h-10 w-10 text-zinc-600" />
                <h3 className="mt-4 font-display text-xl font-bold uppercase text-white">
                  No se encontraron pedidos con esos filtros
                </h3>
                <p className="mt-2 text-xs text-zinc-500">
                  Intenta limpiar la búsqueda o cambiar el filtro de modalidad de pago.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOrderSearchQuery('');
                    setOrderPlanFilter('ALL');
                  }}
                  className="mt-4 cursor-pointer border border-zinc-700 bg-[#070709] px-4 py-2 text-xs uppercase text-white hover:border-[#DC2626]"
                >
                  Restablecer Filtros
                </button>
              </div>
            )}
          </div>
        ) : (
          /* =====================================================================
              VISTA 2: CATÁLOGO DE PRODUCTOS DE MERCH
             ===================================================================== */
          <div id="merch-catalog">
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
                Mostrando {visibleProducts.length}{' '}
                {visibleProducts.length === 1 ? 'producto' : 'productos'}
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
                            <span className="font-mono text-[10px] text-zinc-500">
                              {product.code}
                            </span>
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

                            {(!isOutOfStock || inCartQty > 0) && (
                              <button
                                type="button"
                                onClick={() => handleBuyNow(product)}
                                title="Comprar ahora en pasarela de pago"
                                className="inline-flex cursor-pointer items-center justify-center gap-1.5 border border-zinc-700 bg-[#070709] px-3 py-2.5 font-mono text-[10px] font-bold uppercase text-zinc-200 transition-colors hover:border-[#DC2626] hover:text-white"
                              >
                                <CreditCard className="h-3.5 w-3.5 text-[#DC2626]" />
                                <span>Pagar</span>
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
                <h2 className="mt-4 font-display text-xl font-bold uppercase text-white">
                  Aún no hay productos
                </h2>
                <p className="mt-2 text-sm text-zinc-500">
                  {selectedCategory === 'TODOS'
                    ? 'Estamos preparando mercancía nueva. Vuelve pronto.'
                    : `Todavía no hay productos publicados en ${categoryLabels[selectedCategory]}.`}
                </p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* =====================================================================
          MODAL PARA VISUALIZAR EL CONTENIDO DEL TICKET / ORDEN DE PEDIDO
         ===================================================================== */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/85 p-3 sm:p-6 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={`Detalle del pedido ${selectedOrder.orderId}`}
        >
          <div className="my-auto w-full max-w-3xl overflow-hidden border border-zinc-800 bg-[#0B0B0E] text-[#F4F4F6] shadow-2xl">
            {/* Cabecera del Modal del Ticket */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 bg-[#070709] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center border border-[#DC2626]/60 bg-[#DC2626]/15 text-[#DC2626]">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <span className="block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                    TICKET OFICIAL DE COMPRA · {selectedOrder.authCode}
                  </span>
                  <h2 className="font-display text-lg font-black uppercase text-white sm:text-xl">
                    Orden {selectedOrder.orderId}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {selectedOrder.paymentPlanType === 'CREDITO' ? (
                  <span className="border border-purple-500/70 bg-purple-950/70 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-purple-300">
                    CRÉDITO · {selectedOrder.installments} PAGOS
                  </span>
                ) : (
                  <span className="border border-cyan-500/70 bg-cyan-950/70 px-2.5 py-1 font-mono text-[10px] font-bold uppercase text-cyan-300">
                    PAGO DE CONTADO
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => setSelectedOrderId(null)}
                  className="cursor-pointer border border-zinc-800 p-2 text-zinc-400 hover:border-zinc-600 hover:text-white"
                  aria-label="Cerrar modal del pedido"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Cuerpo del Modal */}
            <div className="max-h-[80vh] space-y-5 overflow-y-auto p-5 sm:p-6 font-mono text-xs">
              {/* Información general del cliente y entrega */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="border border-zinc-800 bg-[#070709] p-4 space-y-1">
                  <span className="block text-[10px] uppercase text-zinc-500">CLIENTE</span>
                  <p className="font-bold text-white">{selectedOrder.customerName}</p>
                  <p className="text-zinc-400">{selectedOrder.customerEmail}</p>
                  <p className="text-zinc-400">{selectedOrder.customerPhone}</p>
                </div>
                <div className="border border-zinc-800 bg-[#070709] p-4 space-y-1">
                  <span className="block text-[10px] uppercase text-zinc-500">ENTREGA</span>
                  <p className="font-bold text-white">
                    {selectedOrder.deliveryMethod === 'PICKUP'
                      ? 'Pick-up en Búnker CDMX'
                      : 'Envío a Domicilio'}
                  </p>
                  <p className="text-zinc-400">{selectedOrder.shippingAddress}</p>
                </div>
                <div className="border border-zinc-800 bg-[#070709] p-4 space-y-1">
                  <span className="block text-[10px] uppercase text-zinc-500">MÉTODO DE PAGO</span>
                  <p className="font-bold text-white">{selectedOrder.paymentSummary}</p>
                  <p className="text-zinc-400">Fecha: {selectedOrder.createdAt}</p>
                </div>
              </div>

              {/* Contenido del pedido (Lista de productos) */}
              <div className="border border-zinc-800 bg-[#070709] overflow-hidden">
                <div className="border-b border-zinc-800 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-zinc-300">
                  Contenido del Pedido (
                  {selectedOrder.items.reduce((sum, item) => sum + item.quantity, 0)} unidades)
                </div>

                <div className="divide-y divide-zinc-800/80">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.productId}
                      className="flex items-center justify-between gap-4 px-4 py-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 shrink-0 border border-zinc-800 object-cover"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{item.name}</p>
                          <p className="text-[10px] text-zinc-500">
                            Código: {item.code} · {item.quantity} x {formatPrice(item.price)}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 font-bold text-white">
                        {formatPrice(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-zinc-800 bg-[#0E0E12] p-4 space-y-1.5">
                  <div className="flex justify-between text-zinc-400">
                    <span>SUBTOTAL:</span>
                    <span>{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                  {selectedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-400">
                      <span>DESCUENTO ({selectedOrder.couponCode}):</span>
                      <span>-{formatPrice(selectedOrder.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-zinc-400">
                    <span>ENVÍO:</span>
                    <span>
                      {selectedOrder.shippingCost === 0
                        ? 'GRATIS'
                        : formatPrice(selectedOrder.shippingCost)}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-zinc-800 pt-2 text-base font-bold text-white">
                    <span>TOTAL DEL PEDIDO:</span>
                    <span className="text-[#DC2626]">{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              {/* Desglose de pagos en caso de ser Crédito */}
              {selectedOrder.paymentPlanType === 'CREDITO' && (() => {
                const summary = getOrderCreditSummary(selectedOrder);
                return (
                  <div className="border border-zinc-800 bg-[#070709] p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        Desglose y Estado de Pagos a Crédito
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[10px] font-bold uppercase ${summary.badgeClassName}`}
                      >
                        <span className={`h-2 w-2 rounded-full ${summary.barClassName}`} />
                        {summary.statusLabel}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {selectedOrder.installmentSchedule.map((inst) => (
                        <div
                          key={inst.installmentNumber}
                          className={`flex items-center justify-between border p-2.5 ${
                            inst.paid
                              ? 'border-emerald-700/60 bg-emerald-950/30'
                              : 'border-red-900/60 bg-red-950/20'
                          }`}
                        >
                          <div>
                            <p className="font-bold text-white">
                              Pago #{inst.installmentNumber} · {formatPrice(inst.amount)}
                            </p>
                            <p className="text-[10px] text-zinc-400">Vence: {inst.dueDate}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleInstallmentPayment(
                                selectedOrder.orderId,
                                inst.installmentNumber,
                              )
                            }
                            className={`cursor-pointer border px-2.5 py-1 text-[10px] font-bold uppercase ${
                              inst.paid
                                ? 'border-emerald-500 bg-emerald-600 text-black'
                                : 'border-red-500/80 bg-red-950/70 text-red-300 hover:bg-red-600 hover:text-white'
                            }`}
                          >
                            {inst.paid ? '✓ Liquidado' : 'Pagar Cuota'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Pie del Modal con botón para Imprimir y botón para Cerrar Modal */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800 pt-4">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex cursor-pointer items-center gap-2 border border-zinc-700 bg-[#070709] px-4 py-2.5 font-mono text-xs uppercase text-zinc-200 hover:border-[#DC2626] hover:text-white"
                >
                  <Printer className="h-4 w-4" />
                  Imprimir Ticket
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedOrderId(null)}
                  className="inline-flex cursor-pointer items-center gap-2 bg-[#DC2626] px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-700"
                >
                  <X className="h-4 w-4" />
                  Cerrar Modal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                    {totalItemsInCart}{' '}
                    {totalItemsInCart === 1 ? 'unidad reservada' : 'unidades reservadas'}
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
                    <span>SUBTOTAL ESTIMADO:</span>
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
                    onClick={handleProceedToPaymentGateway}
                    className="flex flex-1 cursor-pointer items-center justify-center gap-2 bg-[#DC2626] px-5 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-700"
                  >
                    <CreditCard className="h-4 w-4" /> Proceder al Pago
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL DE PASARELA DE PAGO */}
      <MerchPaymentGatewayModal
        isOpen={isPaymentModalOpen}
        items={cartDetailedItems}
        onClose={() => setIsPaymentModalOpen(false)}
        onOrderCompleted={handleOrderCompleted}
      />
    </div>
  );
};

export default MerchCatalog;
