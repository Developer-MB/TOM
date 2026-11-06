import React, { useMemo, useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    Building2,
    CheckCircle2,
    Copy,
    CreditCard,
    Lock,
    MapPin,
    Printer,
    QrCode,
    ShieldCheck,
    Sparkles,
    Tag,
    Truck,
    Wallet,
    X,
} from 'lucide-react';
import type { CmsMerchProduct } from '../../data/CmsTypes';
import {
    buildInstallmentSchedule,
    detectCardBrand,
    FREE_SHIPPING_THRESHOLD,
    PROMO_COUPONS,
    STANDARD_SHIPPING_COST,
    type DeliveryMethodType,
    type MerchOrderItem,
    type MerchOrderRecord,
    type PaymentMethodType,
    type PaymentPlanType,
    type PromoCoupon,
} from '../../data/Merch';

export interface CartDetailedEntry {
    product: CmsMerchProduct;
    quantity: number;
    subtotal: number;
    remainingStock: number;
}

interface MerchPaymentGatewayModalProps {
    isOpen: boolean;
    items: CartDetailedEntry[];
    onClose: () => void;
    onOrderCompleted: (order: MerchOrderRecord) => void;
}

type CheckoutStep = 'SHIPPING' | 'PAYMENT' | 'PROCESSING' | 'RECEIPT';

const formatPrice = (price: number) =>
    new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);

const formatCardNumber = (raw: string): string => {
    const digits = raw.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
};

const formatExpiry = (raw: string): string => {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const fieldClassName =
    'w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-white outline-none transition-colors';

const MerchPaymentGatewayModal: React.FC<MerchPaymentGatewayModalProps> = ({
    isOpen,
    items,
    onClose,
    onOrderCompleted,
}) => {
    const [step, setStep] = useState<CheckoutStep>('SHIPPING');
    const [processingStage, setProcessingStage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Step 1: Shipping / Customer Info
    const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodType>('SHIPPING');
    const [customerName, setCustomerName] = useState('');
    const [customerEmail, setCustomerEmail] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [streetAddress, setStreetAddress] = useState('');
    const [cityState, setCityState] = useState('');
    const [postalCode, setPostalCode] = useState('');

    // Step 2: Payment Method & Details
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('CARD');
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCvv, setCardCvv] = useState('');
    const [installments, setInstallments] = useState<number>(1);
    const [paypalEmail, setPaypalEmail] = useState('');
    const [copiedClabe, setCopiedClabe] = useState(false);

    // Promo Coupon
    const [couponInput, setCouponInput] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState<PromoCoupon | null>(null);
    const [couponError, setCouponError] = useState<string | null>(null);

    // Completed Order Receipt
    const [completedOrder, setCompletedOrder] = useState<MerchOrderRecord | null>(null);

    const speiReference = useMemo(
        () => ({
            clabe: '646180157042891034',
            bank: 'STP (Sistema de Transferencias y Pagos)',
            beneficiary: 'TIME OF METAL MERCH S.A. DE C.V.',
            reference: String(Math.floor(1000000 + Math.random() * 9000000)),
        }),
        [],
    );

    const oxxoReference = useMemo(
        () => '9300-4821-7740-19',
        [],
    );

    const subtotal = useMemo(
        () => items.reduce((acc, item) => acc + item.subtotal, 0),
        [items],
    );

    const discount = useMemo(() => {
        if (!appliedCoupon) return 0;
        if (appliedCoupon.type === 'PERCENT') {
            return Math.round(subtotal * (appliedCoupon.value / 100) * 100) / 100;
        }
        return Math.min(subtotal, appliedCoupon.value);
    }, [subtotal, appliedCoupon]);

    const shippingCost = useMemo(() => {
        if (deliveryMethod === 'PICKUP') return 0;
        if (subtotal - discount >= FREE_SHIPPING_THRESHOLD) return 0;
        return STANDARD_SHIPPING_COST;
    }, [deliveryMethod, subtotal, discount]);

    const total = useMemo(
        () => Math.max(0, subtotal - discount + shippingCost),
        [subtotal, discount, shippingCost],
    );

    const cardBrand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);

    if (!isOpen) return null;

    const handleApplyCoupon = (codeToApply?: string) => {
        setCouponError(null);
        const normalized = (codeToApply ?? couponInput).trim().toUpperCase();
        if (!normalized) return;

        const found = PROMO_COUPONS[normalized];
        if (!found) {
            setCouponError(`El código "${normalized}" no es válido.`);
            return;
        }
        setAppliedCoupon(found);
        setCouponInput(found.code);
    };

    const handleFillTestCard = () => {
        setCardNumber('4532 8910 4421 8894');
        setCardHolder(customerName.toUpperCase() || 'MANRO METALHEAD');
        setCardExpiry('09/29');
        setCardCvv('666');
        setErrorMessage(null);
    };

    const handleContinueToPayment = (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage(null);

        if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
            setErrorMessage('Por favor completa tu nombre, correo electrónico y teléfono de contacto.');
            return;
        }

        if (deliveryMethod === 'SHIPPING') {
            if (!streetAddress.trim() || !cityState.trim() || !postalCode.trim()) {
                setErrorMessage('Completa la calle, ciudad/estado y código postal para el envío a domicilio.');
                return;
            }
        }

        if (!cardHolder.trim()) {
            setCardHolder(customerName.trim().toUpperCase());
        }
        if (!paypalEmail.trim()) {
            setPaypalEmail(customerEmail.trim());
        }

        setStep('PAYMENT');
    };

    const validatePaymentStep = (): string | null => {
        if (paymentMethod === 'CARD') {
            const rawDigits = cardNumber.replace(/\D/g, '');
            if (rawDigits.length < 15 || rawDigits.length > 16) {
                return 'Ingresa un número de tarjeta válido de 15 o 16 dígitos.';
            }
            if (!cardHolder.trim() || cardHolder.trim().length < 3) {
                return 'Ingresa el nombre del titular como aparece en la tarjeta.';
            }
            if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cardExpiry)) {
                return 'Ingresa una fecha de vencimiento válida en formato MM/AA.';
            }
            if (!/^\d{3,4}$/.test(cardCvv)) {
                return 'Ingresa un código de seguridad CVV válido (3 o 4 dígitos).';
            }
        } else if (paymentMethod === 'PAYPAL') {
            if (!paypalEmail.trim() || !paypalEmail.includes('@')) {
                return 'Ingresa el correo electrónico asociado a tu cuenta de PayPal.';
            }
        }
        return null;
    };

    const handleProcessPayment = (event: React.FormEvent) => {
        event.preventDefault();
        setErrorMessage(null);

        const validationError = validatePaymentStep();
        if (validationError) {
            setErrorMessage(validationError);
            return;
        }

        setStep('PROCESSING');
        setProcessingStage('Verificando disponibilidad de inventario en tiempo real...');

        window.setTimeout(() => {
            setProcessingStage('Cifrando token de pago mediante TLS 1.3 / PCI-DSS...');
        }, 650);

        window.setTimeout(() => {
            setProcessingStage(
                paymentMethod === 'CARD'
                    ? `Autorizando cargo con red ${cardBrand}…`
                    : paymentMethod === 'PAYPAL'
                        ? 'Validando autorización con PayPal Checkout…'
                        : 'Generando orden y reservando unidades en inventario…',
            );
        }, 1350);

        window.setTimeout(() => {
            const rawDigits = cardNumber.replace(/\D/g, '');
            const last4 = rawDigits.slice(-4) || '8894';
            const effectiveInstallments = installments > 1 ? installments : 1;
            const paymentPlanType: PaymentPlanType = effectiveInstallments > 1 ? 'CREDITO' : 'CONTADO';
            const installmentSchedule =
                paymentPlanType === 'CREDITO'
                    ? buildInstallmentSchedule(total, effectiveInstallments)
                    : [];

            const planSuffix =
                paymentPlanType === 'CREDITO'
                    ? ` (Crédito · ${effectiveInstallments} pagos de ${formatPrice(total / effectiveInstallments)})`
                    : ' (Pago de Contado)';

            const paymentSummary =
                paymentMethod === 'CARD'
                    ? `${cardBrand} terminación •••• ${last4}${planSuffix}`
                    : paymentMethod === 'SPEI'
                        ? `SPEI CLABE ${speiReference.clabe} · Ref ${speiReference.reference}${planSuffix}`
                        : paymentMethod === 'OXXO'
                            ? `OXXO Pay · Referencia ${oxxoReference}${planSuffix}`
                            : `PayPal (${paypalEmail.trim()})${planSuffix}`;

            const orderItems: MerchOrderItem[] = items.map(({ product, quantity, subtotal: itemSub }) => ({
                productId: product.id,
                code: product.code,
                name: product.name,
                price: product.price,
                quantity,
                subtotal: itemSub,
                image: product.image,
            }));

            const now = new Date();
            const order: MerchOrderRecord = {
                orderId: `TOM-ORD-${Date.now().toString().slice(-6)}`,
                authCode: `AUTH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
                createdAt: now.toLocaleString('es-MX', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                createdAtTimestamp: now.getTime(),
                customerName: customerName.trim(),
                customerEmail: customerEmail.trim(),
                customerPhone: customerPhone.trim(),
                deliveryMethod,
                shippingAddress:
                    deliveryMethod === 'PICKUP'
                        ? 'Recolección en Cabina Central CDMX (Sin costo)'
                        : `${streetAddress.trim()}, ${cityState.trim()}, C.P. ${postalCode.trim()}`,
                paymentMethod,
                paymentPlanType,
                paymentSummary,
                installments: effectiveInstallments,
                installmentSchedule,
                couponCode: appliedCoupon?.code,
                subtotal,
                discount,
                shippingCost,
                total,
                status:
                    paymentPlanType === 'CREDITO' || paymentMethod === 'OXXO'
                        ? 'PENDIENTE_PAGO'
                        : 'PAGADO',
                items: orderItems,
            };

            setCompletedOrder(order);
            onOrderCompleted(order);
            setStep('RECEIPT');
        }, 2100);
    };

    const handleCloseModal = () => {
        setStep('SHIPPING');
        setCompletedOrder(null);
        setErrorMessage(null);
        onClose();
    };

    const handleCopyClabe = () => {
        navigator.clipboard?.writeText(speiReference.clabe);
        setCopiedClabe(true);
        window.setTimeout(() => setCopiedClabe(false), 2500);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto"
            role="dialog"
            aria-modal="true"
            aria-label="Pasarela de pago Time of Metal"
        >
            <div className="my-auto w-full max-w-4xl border border-zinc-800 bg-[#0B0B0E] text-[#F4F4F6] shadow-2xl overflow-hidden">
                {/* HEADER DE LA PASARELA */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 bg-[#070709] px-5 sm:px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center border border-[#DC2626]/60 bg-[#DC2626]/15 text-[#DC2626]">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-emerald-400">
                                <Lock className="h-3 w-3" /> PASARELA CIFRADA TLS 1.3 · TIME OF METAL PAY
                            </div>
                            <h2 className="font-display text-lg sm:text-xl font-black uppercase text-white">
                                {step === 'RECEIPT' ? 'Comprobante Oficial de Compra' : 'Finalizar Compra Segura'}
                            </h2>
                        </div>
                    </div>

                    {/* Indicador de pasos */}
                    <div className="flex items-center gap-2 font-mono text-[10px] uppercase">
                        <span
                            className={`px-2.5 py-1 border ${
                                step === 'SHIPPING'
                                    ? 'border-[#DC2626] bg-[#DC2626] text-white font-bold'
                                    : 'border-zinc-800 bg-[#0E0E12] text-zinc-400'
                            }`}
                        >
                            1. Envío
                        </span>
                        <span
                            className={`px-2.5 py-1 border ${
                                step === 'PAYMENT' || step === 'PROCESSING'
                                    ? 'border-[#DC2626] bg-[#DC2626] text-white font-bold'
                                    : 'border-zinc-800 bg-[#0E0E12] text-zinc-400'
                            }`}
                        >
                            2. Pago
                        </span>
                        <span
                            className={`px-2.5 py-1 border ${
                                step === 'RECEIPT'
                                    ? 'border-emerald-600 bg-emerald-950/60 text-emerald-300 font-bold'
                                    : 'border-zinc-800 bg-[#0E0E12] text-zinc-400'
                            }`}
                        >
                            3. Recibo
                        </span>

                        {step !== 'PROCESSING' && (
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="ml-2 border border-zinc-800 p-2 text-zinc-400 hover:border-zinc-600 hover:text-white cursor-pointer"
                                aria-label="Cerrar pasarela de pago"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* PASO: PROCESANDO TRANSACCIÓN */}
                {step === 'PROCESSING' && (
                    <div className="flex flex-col items-center justify-center px-6 py-20 text-center space-y-5">
                        <div className="h-14 w-14 animate-spin rounded-full border-4 border-zinc-800 border-t-[#DC2626]" />
                        <div className="space-y-2">
                            <p className="font-mono text-xs uppercase tracking-widest text-[#DC2626]">
                                PROCESANDO TRANSACCIÓN BANCARIA
                            </p>
                            <h3 className="font-display text-2xl font-black uppercase text-white">
                                {processingStage}
                            </h3>
                            <p className="font-mono text-xs text-zinc-500">
                                Por favor no cierres ni recargues esta ventana…
                            </p>
                        </div>
                    </div>
                )}

                {/* PASO 3: COMPROBANTE / RECIBO DE COMPRA */}
                {step === 'RECEIPT' && completedOrder && (
                    <div className="p-5 sm:p-8 space-y-6 max-h-[82vh] overflow-y-auto">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-700/60 bg-emerald-950/30 p-5">
                            <div className="flex items-start gap-3.5">
                                <CheckCircle2 className="h-7 w-7 text-emerald-400 shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 block">
                                        {completedOrder.status === 'PAGADO'
                                            ? 'TRANSACCIÓN APROBADA E INVENTARIO ACTUALIZADO'
                                            : 'ORDEN RESERVADA · PENDIENTE DE PAGO EN OXXO'}
                                    </span>
                                    <h3 className="font-display text-xl sm:text-2xl font-black uppercase text-white">
                                        ¡Gracias por tu compra, {completedOrder.customerName}!
                                    </h3>
                                    <p className="font-mono text-xs text-zinc-300 mt-1">
                                        Hemos enviado la confirmación a <strong>{completedOrder.customerEmail}</strong>
                                    </p>
                                </div>
                            </div>
                            <div className="font-mono text-left sm:text-right shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0 border-emerald-800/40">
                                <div className="text-[10px] text-zinc-400">FOLIO DE ORDEN</div>
                                <div className="text-sm font-bold text-white">{completedOrder.orderId}</div>
                                <div className="text-[10px] text-emerald-400 mt-0.5">{completedOrder.authCode}</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                            <div className="border border-zinc-800 bg-[#070709] p-4 space-y-1">
                                <span className="text-[10px] uppercase text-zinc-500 block">CLIENTE</span>
                                <p className="text-white font-bold">{completedOrder.customerName}</p>
                                <p className="text-zinc-400">{completedOrder.customerEmail}</p>
                                <p className="text-zinc-400">{completedOrder.customerPhone}</p>
                            </div>
                            <div className="border border-zinc-800 bg-[#070709] p-4 space-y-1">
                                <span className="text-[10px] uppercase text-zinc-500 block">ENTREGA</span>
                                <p className="text-white font-bold">
                                    {completedOrder.deliveryMethod === 'PICKUP'
                                        ? 'Pick-up en Cabina CDMX'
                                        : 'Envío Estándar a Domicilio'}
                                </p>
                                <p className="text-zinc-400">{completedOrder.shippingAddress}</p>
                            </div>
                            <div className="border border-zinc-800 bg-[#070709] p-4 space-y-1">
                                <span className="text-[10px] uppercase text-zinc-500 block">MÉTODO DE PAGO</span>
                                <p className="text-white font-bold">{completedOrder.paymentSummary}</p>
                                <p className="text-zinc-400">Fecha: {completedOrder.createdAt}</p>
                            </div>
                        </div>

                        <div className="border border-zinc-800 bg-[#070709] overflow-hidden">
                            <div className="border-b border-zinc-800 px-4 py-2.5 font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                                ARTÍCULOS ADQUIRIDOS ({completedOrder.items.reduce((s, i) => s + i.quantity, 0)})
                            </div>
                            <div className="divide-y divide-zinc-800/80 font-mono text-xs">
                                {completedOrder.items.map((item) => (
                                    <div key={item.productId} className="flex items-center justify-between px-4 py-3 gap-4">
                                        <div>
                                            <span className="text-white font-bold">{item.name}</span>
                                            <span className="block text-[10px] text-zinc-500">
                                                {item.code} · {item.quantity} x {formatPrice(item.price)}
                                            </span>
                                        </div>
                                        <span className="text-white font-bold">{formatPrice(item.subtotal)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-zinc-800 bg-[#0E0E12] p-4 space-y-1.5 font-mono text-xs">
                                <div className="flex justify-between text-zinc-400">
                                    <span>SUBTOTAL:</span>
                                    <span>{formatPrice(completedOrder.subtotal)}</span>
                                </div>
                                {completedOrder.discount > 0 && (
                                    <div className="flex justify-between text-emerald-400">
                                        <span>DESCUENTO ({completedOrder.couponCode}):</span>
                                        <span>-{formatPrice(completedOrder.discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-zinc-400">
                                    <span>ENVÍO:</span>
                                    <span>
                                        {completedOrder.shippingCost === 0
                                            ? 'GRATIS'
                                            : formatPrice(completedOrder.shippingCost)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-zinc-800">
                                    <span>TOTAL PAGADO:</span>
                                    <span className="text-[#DC2626]">{formatPrice(completedOrder.total)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => window.print()}
                                className="inline-flex items-center gap-2 border border-zinc-700 bg-[#070709] px-4 py-3 font-mono text-xs uppercase text-zinc-200 hover:border-[#DC2626] hover:text-white cursor-pointer"
                            >
                                <Printer className="h-4 w-4" /> Imprimir / Guardar PDF
                            </button>

                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="bg-[#DC2626] hover:bg-red-700 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white cursor-pointer"
                            >
                                VOLVER A LA TIENDA DE MERCH
                            </button>
                        </div>
                    </div>
                )}

                {/* PASOS 1 Y 2: ENVÍO Y PAGO + RESUMEN LATERAL */}
                {(step === 'SHIPPING' || step === 'PAYMENT') && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[82vh] overflow-y-auto">
                        {/* COLUMNA IZQUIERDA (7 COLS): FORMULARIO ACTIVO */}
                        <div className="lg:col-span-7 p-5 sm:p-6 border-b lg:border-b-0 lg:border-r border-zinc-800">
                            {errorMessage && (
                                <div
                                    role="alert"
                                    className="mb-5 border border-red-900 bg-red-950/40 px-4 py-3 font-mono text-xs text-red-300"
                                >
                                    {errorMessage}
                                </div>
                            )}

                            {step === 'SHIPPING' ? (
                                <form onSubmit={handleContinueToPayment} className="space-y-5">
                                    <div>
                                        <span className="font-mono text-[10px] uppercase tracking-widest text-[#DC2626] block">
                                            PASO 1 DE 2
                                        </span>
                                        <h3 className="font-display text-lg font-black uppercase text-white">
                                            Datos de Contacto y Entrega
                                        </h3>
                                    </div>

                                    {/* Selector de Método de Entrega */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setDeliveryMethod('SHIPPING')}
                                            className={`p-3.5 border text-left font-mono transition-colors cursor-pointer ${
                                                deliveryMethod === 'SHIPPING'
                                                    ? 'border-[#DC2626] bg-[#DC2626]/10 text-white'
                                                    : 'border-zinc-800 bg-[#070709] text-zinc-400 hover:border-zinc-700'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between text-xs font-bold uppercase">
                                                <span className="flex items-center gap-2">
                                                    <Truck className="h-4 w-4 text-[#DC2626]" /> Envío a Domicilio
                                                </span>
                                                <span>
                                                    {subtotal - discount >= FREE_SHIPPING_THRESHOLD
                                                        ? 'GRATIS'
                                                        : formatPrice(STANDARD_SHIPPING_COST)}
                                                </span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 mt-1">
                                                Gratis en pedidos desde {formatPrice(FREE_SHIPPING_THRESHOLD)}
                                            </p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setDeliveryMethod('PICKUP')}
                                            className={`p-3.5 border text-left font-mono transition-colors cursor-pointer ${
                                                deliveryMethod === 'PICKUP'
                                                    ? 'border-[#DC2626] bg-[#DC2626]/10 text-white'
                                                    : 'border-zinc-800 bg-[#070709] text-zinc-400 hover:border-zinc-700'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between text-xs font-bold uppercase">
                                                <span className="flex items-center gap-2">
                                                    <MapPin className="h-4 w-4 text-[#DC2626]" /> Pick-up Búnker
                                                </span>
                                                <span className="text-emerald-400">GRATIS</span>
                                            </div>
                                            <p className="text-[10px] text-zinc-500 mt-1">
                                                Recolección directa en Cabina CDMX
                                            </p>
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <label className="block sm:col-span-2">
                                            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                                                Nombre Completo *
                                            </span>
                                            <input
                                                required
                                                type="text"
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                placeholder="Ej: Manro Metalhead"
                                                className={fieldClassName}
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                                                Correo Electrónico *
                                            </span>
                                            <input
                                                required
                                                type="email"
                                                value={customerEmail}
                                                onChange={(e) => setCustomerEmail(e.target.value)}
                                                placeholder="cliente@timeofmetal.fm"
                                                className={fieldClassName}
                                            />
                                        </label>

                                        <label className="block">
                                            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                                                Teléfono (10 dígitos) *
                                            </span>
                                            <input
                                                required
                                                type="tel"
                                                value={customerPhone}
                                                onChange={(e) => setCustomerPhone(e.target.value)}
                                                placeholder="55 1234 5678"
                                                className={fieldClassName}
                                            />
                                        </label>

                                        {deliveryMethod === 'SHIPPING' && (
                                            <>
                                                <label className="block sm:col-span-2">
                                                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                                                        Calle, Número e Interior *
                                                    </span>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={streetAddress}
                                                        onChange={(e) => setStreetAddress(e.target.value)}
                                                        placeholder="Av. Insurgentes Sur 666, Col. Roma Norte"
                                                        className={fieldClassName}
                                                    />
                                                </label>

                                                <label className="block">
                                                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                                                        Ciudad y Estado *
                                                    </span>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={cityState}
                                                        onChange={(e) => setCityState(e.target.value)}
                                                        placeholder="Ciudad de México, CDMX"
                                                        className={fieldClassName}
                                                    />
                                                </label>

                                                <label className="block">
                                                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                                                        Código Postal *
                                                    </span>
                                                    <input
                                                        required
                                                        type="text"
                                                        maxLength={5}
                                                        value={postalCode}
                                                        onChange={(e) =>
                                                            setPostalCode(e.target.value.replace(/\D/g, ''))
                                                        }
                                                        placeholder="06700"
                                                        className={fieldClassName}
                                                    />
                                                </label>
                                            </>
                                        )}
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            className="inline-flex items-center gap-2 bg-[#DC2626] hover:bg-red-700 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors cursor-pointer"
                                        >
                                            CONTINUAR AL PAGO <ArrowRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleProcessPayment} className="space-y-5">
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <span className="font-mono text-[10px] uppercase tracking-widest text-[#DC2626] block">
                                                PASO 2 DE 2
                                            </span>
                                            <h3 className="font-display text-lg font-black uppercase text-white">
                                                Selecciona tu Método de Pago
                                            </h3>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setErrorMessage(null);
                                                setStep('SHIPPING');
                                            }}
                                            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase text-zinc-400 hover:text-white cursor-pointer"
                                        >
                                            <ArrowLeft className="h-3.5 w-3.5" /> Editar dirección
                                        </button>
                                    </div>

                                    {/* Pestañas de Método de Pago */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[10px]">
                                        {[
                                            { id: 'CARD', label: 'Tarjeta', icon: CreditCard },
                                            { id: 'SPEI', label: 'SPEI', icon: Building2 },
                                            { id: 'OXXO', label: 'OXXO Pay', icon: QrCode },
                                            { id: 'PAYPAL', label: 'PayPal', icon: Wallet },
                                        ].map((method) => {
                                            const Icon = method.icon;
                                            const active = paymentMethod === method.id;
                                            return (
                                                <button
                                                    key={method.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setPaymentMethod(method.id as PaymentMethodType);
                                                        setErrorMessage(null);
                                                    }}
                                                    className={`flex flex-col items-center justify-center gap-1.5 border py-3 px-2 uppercase transition-colors cursor-pointer ${
                                                        active
                                                            ? 'border-[#DC2626] bg-[#DC2626]/15 text-white font-bold'
                                                            : 'border-zinc-800 bg-[#070709] text-zinc-400 hover:border-zinc-700 hover:text-white'
                                                    }`}
                                                >
                                                    <Icon className="h-4 w-4 text-[#DC2626]" />
                                                    <span>{method.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>

                                    {/* MÉTODO 1: TARJETA BANCARIA */}
                                    {paymentMethod === 'CARD' && (
                                        <div className="space-y-4">
                                            {/* Tarjeta Interactiva en Vivo */}
                                            <div className="relative overflow-hidden border border-zinc-700 bg-gradient-to-br from-[#18181F] via-[#0E0E13] to-[#2A090D] p-5 font-mono text-white shadow-inner">
                                                <div className="flex items-center justify-between mb-6">
                                                    <span className="text-[10px] uppercase tracking-widest text-zinc-400">
                                                        TIME OF METAL · {cardBrand}
                                                    </span>
                                                    <span className="border border-[#DC2626]/60 bg-[#DC2626]/20 px-2 py-0.5 text-[10px] font-bold text-[#EF4444]">
                                                        {cardBrand}
                                                    </span>
                                                </div>
                                                <div className="text-base sm:text-lg tracking-[0.2em] font-bold text-white mb-5">
                                                    {cardNumber || '•••• •••• •••• ••••'}
                                                </div>
                                                <div className="flex items-center justify-between text-[10px] text-zinc-400">
                                                    <div className="truncate pr-3">
                                                        <span className="block text-[8px] text-zinc-500">TITULAR</span>
                                                        <span className="text-xs text-white uppercase">
                                                            {cardHolder || 'NOMBRE DEL TITULAR'}
                                                        </span>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <span className="block text-[8px] text-zinc-500">VENCE</span>
                                                        <span className="text-xs text-white">
                                                            {cardExpiry || 'MM/AA'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={handleFillTestCard}
                                                    className="inline-flex items-center gap-1.5 border border-zinc-700 bg-[#070709] px-2.5 py-1 font-mono text-[10px] uppercase text-amber-400 hover:border-amber-500 cursor-pointer"
                                                >
                                                    <Sparkles className="h-3 w-3" /> Autocompletar Tarjeta de Prueba
                                                </button>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <label className="block sm:col-span-2">
                                                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                                                        Número de Tarjeta (16 dígitos) *
                                                    </span>
                                                    <input
                                                        required
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={cardNumber}
                                                        onChange={(e) =>
                                                            setCardNumber(formatCardNumber(e.target.value))
                                                        }
                                                        placeholder="4532 8910 4421 8894"
                                                        className={fieldClassName}
                                                    />
                                                </label>

                                                <label className="block sm:col-span-2">
                                                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                                                        Nombre del Titular *
                                                    </span>
                                                    <input
                                                        required
                                                        type="text"
                                                        value={cardHolder}
                                                        onChange={(e) =>
                                                            setCardHolder(e.target.value.toUpperCase())
                                                        }
                                                        placeholder="COMO APARECE EN LA TARJETA"
                                                        className={fieldClassName}
                                                    />
                                                </label>

                                                <label className="block">
                                                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                                                        Vencimiento (MM/AA) *
                                                    </span>
                                                    <input
                                                        required
                                                        type="text"
                                                        inputMode="numeric"
                                                        value={cardExpiry}
                                                        onChange={(e) =>
                                                            setCardExpiry(formatExpiry(e.target.value))
                                                        }
                                                        placeholder="09/29"
                                                        className={fieldClassName}
                                                    />
                                                </label>

                                                <label className="block">
                                                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                                                        CVV / CVC *
                                                    </span>
                                                    <input
                                                        required
                                                        type="password"
                                                        inputMode="numeric"
                                                        maxLength={4}
                                                        value={cardCvv}
                                                        onChange={(e) =>
                                                            setCardCvv(e.target.value.replace(/\D/g, ''))
                                                        }
                                                        placeholder="•••"
                                                        className={fieldClassName}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    )}

                                    {/* MÉTODO 2: TRANSFERENCIA SPEI */}
                                    {paymentMethod === 'SPEI' && (
                                        <div className="border border-zinc-800 bg-[#070709] p-4 space-y-3 font-mono text-xs">
                                            <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                                                TRANSFERENCIA INTERBANCARIA SPEI 24/7
                                            </div>
                                            <p className="text-zinc-400 text-[11px]">
                                                Realiza la transferencia desde tu banca móvil usando los siguientes datos y confirma tu pedido:
                                            </p>
                                            <div className="space-y-2 border-t border-zinc-800 pt-3">
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-500">BANCO RECEPTOR:</span>
                                                    <span className="text-white font-bold">{speiReference.bank}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-500">BENEFICIARIO:</span>
                                                    <span className="text-white font-bold">{speiReference.beneficiary}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-zinc-500">CLABE (18 DÍGITOS):</span>
                                                    <span className="flex items-center gap-2">
                                                        <code className="bg-[#0E0E12] border border-zinc-700 px-2 py-0.5 text-emerald-400 font-bold">
                                                            {speiReference.clabe}
                                                        </code>
                                                        <button
                                                            type="button"
                                                            onClick={handleCopyClabe}
                                                            className="border border-zinc-700 px-2 py-0.5 text-[10px] text-zinc-300 hover:border-[#DC2626] hover:text-white cursor-pointer"
                                                        >
                                                            <Copy className="h-3 w-3 inline mr-1" />
                                                            {copiedClabe ? 'Copiada' : 'Copiar'}
                                                        </button>
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-zinc-500">REFERENCIA NUMÉRICA:</span>
                                                    <span className="text-amber-400 font-bold">{speiReference.reference}</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* MÉTODO 3: OXXO PAY */}
                                    {paymentMethod === 'OXXO' && (
                                        <div className="border border-zinc-800 bg-[#070709] p-4 space-y-3 font-mono text-xs text-center">
                                            <div className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">
                                                FICHA DIGITAL OXXO PAY
                                            </div>
                                            <p className="text-zinc-400 text-[11px]">
                                                Dicta al cajero los 14 dígitos o muestra el código de barras para acreditar tu compra en tiempo real:
                                            </p>
                                            <div className="bg-white text-black py-3 px-4 mx-auto max-w-xs font-mono">
                                                <div className="h-10 w-full bg-[repeating-linear-gradient(90deg,#000,#000_2px,#fff_2px,#fff_5px,#000_5px,#000_9px,#fff_9px,#fff_12px)] mb-2" />
                                                <div className="font-bold tracking-widest text-sm">
                                                    {oxxoReference}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* MÉTODO 4: PAYPAL */}
                                    {paymentMethod === 'PAYPAL' && (
                                        <div className="border border-zinc-800 bg-[#070709] p-4 space-y-3">
                                            <div className="font-mono text-[10px] uppercase tracking-widest text-cyan-400 font-bold">
                                                AUTORIZACIÓN RÁPIDA CON PAYPAL
                                            </div>
                                            <label className="block">
                                                <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
                                                    Correo de tu cuenta PayPal *
                                                </span>
                                                <input
                                                    required
                                                    type="email"
                                                    value={paypalEmail}
                                                    onChange={(e) => setPaypalEmail(e.target.value)}
                                                    placeholder="tu-cuenta@paypal.com"
                                                    className={fieldClassName}
                                                />
                                            </label>
                                        </div>
                                    )}

                                    {/* MODALIDAD DE COMPRA: CONTADO VS CRÉDITO */}
                                    <div className="border border-zinc-800 bg-[#070709] p-4 space-y-3 font-mono">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                                                Modalidad de Compra (Contado o Crédito)
                                            </span>
                                            <span
                                                className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                                                    installments === 1
                                                        ? 'border-cyan-500/60 bg-cyan-950/60 text-cyan-300'
                                                        : 'border-purple-500/60 bg-purple-950/60 text-purple-300'
                                                }`}
                                            >
                                                {installments === 1 ? 'CONTADO · 1 PAGO' : `CRÉDITO · ${installments} PAGOS`}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                                            {[
                                                { count: 1, label: 'Contado (1 pago)' },
                                                { count: 3, label: 'Crédito 3 MSI' },
                                                { count: 6, label: 'Crédito 6 MSI' },
                                                { count: 12, label: 'Crédito 12 MSI' },
                                            ].map((plan) => {
                                                const isSelected = installments === plan.count;
                                                const isCreditPlan = plan.count > 1;
                                                return (
                                                    <button
                                                        key={plan.count}
                                                        type="button"
                                                        onClick={() => setInstallments(plan.count)}
                                                        className={`p-2.5 border text-left transition-colors cursor-pointer ${
                                                            isSelected
                                                                ? isCreditPlan
                                                                    ? 'border-purple-500 bg-purple-950/50 text-purple-200 font-bold'
                                                                    : 'border-cyan-500 bg-cyan-950/50 text-cyan-200 font-bold'
                                                                : 'border-zinc-800 bg-[#0E0E12] text-zinc-400 hover:border-zinc-600 hover:text-white'
                                                        }`}
                                                    >
                                                        <span className="block uppercase">{plan.label}</span>
                                                        <span className="block text-[11px] text-white mt-0.5">
                                                            {formatPrice(total / plan.count)}
                                                            {isCreditPlan ? '/mes' : ''}
                                                        </span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setStep('SHIPPING')}
                                            className="border border-zinc-700 px-4 py-3 font-mono text-xs uppercase text-zinc-300 hover:border-zinc-500 hover:text-white cursor-pointer"
                                        >
                                            Atrás
                                        </button>
                                        <button
                                            type="submit"
                                            className="flex-1 bg-[#DC2626] hover:bg-red-700 px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <Lock className="h-4 w-4" /> PAGAR {formatPrice(total)} AHORA
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>

                        {/* COLUMNA DERECHA (5 COLS): RESUMEN DE ORDEN Y CUPONES */}
                        <div className="lg:col-span-5 bg-[#070709] p-5 sm:p-6 flex flex-col justify-between space-y-5">
                            <div className="space-y-4">
                                <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white border-b border-zinc-800 pb-3">
                                    Resumen del Pedido ({items.reduce((s, i) => s + i.quantity, 0)} uds)
                                </h3>

                                <div className="max-h-56 overflow-y-auto space-y-2.5 pr-1">
                                    {items.map(({ product, quantity, subtotal: itemSub }) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between gap-3 border border-zinc-800/80 bg-[#0E0E12] p-2.5 font-mono text-xs"
                                        >
                                            <div className="flex items-center gap-2.5 min-w-0">
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="h-10 w-10 object-cover border border-zinc-800 shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-white font-bold truncate">{product.name}</p>
                                                    <p className="text-[10px] text-zinc-500">
                                                        {quantity} x {formatPrice(product.price)}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className="text-white font-bold shrink-0">
                                                {formatPrice(itemSub)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* CUPÓN DE DESCUENTO */}
                                <div className="border-t border-zinc-800 pt-4 space-y-2">
                                    <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                                        <Tag className="h-3 w-3 text-[#DC2626]" /> Cupón de descuento
                                    </span>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                            placeholder="METAL10, MOSHPIT15 o TOMVIP"
                                            className="flex-1 bg-[#0E0E12] border border-zinc-800 focus:border-[#DC2626] px-3 py-2 font-mono text-xs text-white outline-none uppercase"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleApplyCoupon()}
                                            className="border border-zinc-700 bg-[#0E0E12] hover:border-[#DC2626] px-3 py-2 font-mono text-[10px] font-bold uppercase text-white cursor-pointer"
                                        >
                                            Aplicar
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-1.5 pt-1">
                                        {Object.values(PROMO_COUPONS).map((c) => (
                                            <button
                                                key={c.code}
                                                type="button"
                                                onClick={() => handleApplyCoupon(c.code)}
                                                className={`px-2 py-0.5 font-mono text-[9px] uppercase border cursor-pointer ${
                                                    appliedCoupon?.code === c.code
                                                        ? 'border-emerald-600 bg-emerald-950/60 text-emerald-300 font-bold'
                                                        : 'border-zinc-800 bg-[#0E0E12] text-zinc-400 hover:text-white'
                                                }`}
                                            >
                                                {c.code}
                                            </button>
                                        ))}
                                    </div>
                                    {couponError && (
                                        <p className="font-mono text-[10px] text-red-400">{couponError}</p>
                                    )}
                                    {appliedCoupon && (
                                        <p className="font-mono text-[10px] text-emerald-400">
                                            ✓ {appliedCoupon.code}: {appliedCoupon.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* DESGLOSE FINAL DE IMPORTES */}
                            <div className="border-t border-zinc-800 pt-4 space-y-2 font-mono text-xs">
                                <div className="flex justify-between text-zinc-400">
                                    <span>SUBTOTAL:</span>
                                    <span>{formatPrice(subtotal)}</span>
                                </div>
                                {discount > 0 && (
                                    <div className="flex justify-between text-emerald-400">
                                        <span>DESCUENTO ({appliedCoupon?.code}):</span>
                                        <span>-{formatPrice(discount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-zinc-400">
                                    <span>ENVÍO:</span>
                                    <span>
                                        {shippingCost === 0 ? (
                                            <strong className="text-emerald-400">GRATIS</strong>
                                        ) : (
                                            formatPrice(shippingCost)
                                        )}
                                    </span>
                                </div>
                                <div className="flex justify-between text-base font-bold text-white border-t border-zinc-800 pt-3">
                                    <span>TOTAL:</span>
                                    <span className="text-[#DC2626]">{formatPrice(total)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MerchPaymentGatewayModal;

