import { useEffect, useRef, useState } from 'react';
import { Save, ShoppingBag } from 'lucide-react';
import { MERCH_CATEGORIES, type CmsMerchProduct, type CmsPostStatus, type MerchCategory } from '../../data/CmsTypes';
import { getStockBadgeInfo } from '../../data/Merch';
import { readJsonResponse } from '../../data/readJsonResponse';
import { authenticatedCmsFetch, uploadCmsImage } from '../../lib/firebaseClient';
import { sanitizeHttpUrl, sanitizePlainText } from '../../utils/security';

interface PublishMerchFormProps {
  draft?: CmsMerchProduct | null;
  existingProducts?: CmsMerchProduct[];
  onSaveProduct: (product: CmsMerchProduct) => void;
  onFinishEditing?: () => void;
}

const fieldClassName =
  'w-full bg-[#070709] border border-zinc-800 focus:border-[#DC2626] px-3.5 py-2.5 text-xs font-mono text-white outline-none';
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const maxImageSize = 5 * 1024 * 1024;
const categoryLabels: Record<MerchCategory, string> = {
  PLAYERAS: 'PLAYERAS',
  VASOS: 'VASOS',
  TARROS: 'TARROS',
  GORRAS: 'GORRAS',
  LLAVEROS: 'LLAVEROS',
  MOUSEPADS: 'MOUSEPADS',
  OTROS: 'OTROS',
};

const toLocalDateTimeInput = (value: string | undefined) => {
  if (!value) return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  const timezoneOffset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
};

const generateNextMerchCode = (products: CmsMerchProduct[]): string => {
  const highest = products.reduce((max, item) => {
    const num = Number(item.code?.match(/^TOM-MER-(\d+)$/)?.[1]);
    return Number.isFinite(num) ? Math.max(max, num) : max;
  }, 0);
  return `TOM-MER-${String(highest + 1).padStart(4, '0')}`;
};

const PublishMerchForm = ({
  draft = null,
  existingProducts = [],
  onSaveProduct,
  onFinishEditing,
}: PublishMerchFormProps) => {
  const formContainerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MerchCategory>('PLAYERAS');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('10');
  const [purchaseUrl, setPurchaseUrl] = useState('');
  const [status, setStatus] = useState<CmsPostStatus>('PUBLICADO');
  const [publishDate, setPublishDate] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const resetForm = () => {
    setName('');
    setCategory('PLAYERAS');
    setDescription('');
    setPrice('');
    setStock('10');
    setPurchaseUrl('');
    setStatus('PUBLICADO');
    setPublishDate('');
    setImage(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  useEffect(() => {
    if (!draft) return;
    setName(draft.name);
    setCategory(draft.category);
    setDescription(draft.description);
    setPrice(String(draft.price));
    setStock(String(draft.stock ?? 0));
    setPurchaseUrl(draft.purchaseUrl);
    setStatus(draft.status);
    setPublishDate(toLocalDateTimeInput(draft.publish));
    setImage(null);
    if (imageInputRef.current) imageInputRef.current.value = '';
    setFormError(null);
    setSuccessMessage(null);
    formContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [draft]);

  const handleCancelEditing = () => {
    resetForm();
    setFormError(null);
    setSuccessMessage(null);
    onFinishEditing?.();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setFormError(null);
    if (file && !allowedImageTypes.includes(file.type)) {
      setImage(null);
      event.target.value = '';
      setFormError('Elige una imagen JPG, PNG, WebP o GIF.');
      return;
    }
    if (file && file.size > maxImageSize) {
      setImage(null);
      event.target.value = '';
      setFormError('La imagen no puede superar los 5 MB.');
      return;
    }
    setImage(file);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    if (!draft && !image) {
      setFormError('Selecciona una imagen del producto.');
      return;
    }
    const parsedPrice = Number(price);
    const parsedStock = Math.max(0, Math.floor(Number(stock)));
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      setFormError('Indica un precio válido.');
      return;
    }
    if (!Number.isFinite(parsedStock) || parsedStock < 0) {
      setFormError('Indica una cantidad de inventario válida (0 o más).');
      return;
    }
    if (status === 'PROGRAMADO' && !publishDate) {
      setFormError('Indica la fecha y hora de publicación programada.');
      return;
    }

    const cleanPurchaseUrl = purchaseUrl.trim() ? sanitizeHttpUrl(purchaseUrl) : '';
    if (purchaseUrl.trim() && !cleanPurchaseUrl) {
      setFormError('El enlace externo debe iniciar con https:// o http://.');
      return;
    }

    setIsSaving(true);
    setFormError(null);
    setSuccessMessage(null);

    try {
      const imageUrl = image ? await uploadCmsImage(image, 'merch') : draft?.image ?? '';
      const publishIso = status === 'PROGRAMADO'
        ? new Date(publishDate).toISOString()
        : status === 'PUBLICADO'
          ? (draft?.status === 'PUBLICADO' && draft.publish ? draft.publish : new Date().toISOString())
          : '';

      const payload = {
        name: sanitizePlainText(name, 150),
        category,
        description: sanitizePlainText(description, 2000),
        price: Math.round(parsedPrice * 100) / 100,
        stock: parsedStock,
        purchaseUrl: cleanPurchaseUrl,
        status,
        publish: publishIso,
        image: imageUrl,
      };

      let savedProduct: CmsMerchProduct;
      try {
        const response = await authenticatedCmsFetch(
          draft ? `/api/cms/merch/${encodeURIComponent(draft.id)}` : '/api/cms/merch',
          {
            method: draft ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          },
        );
        savedProduct = await readJsonResponse<CmsMerchProduct>(
          response,
          'No se pudo guardar el producto.',
        );
      } catch {
        // Local persistence fallback when running without Firestore backend
        savedProduct = {
          id: draft ? draft.id : crypto.randomUUID(),
          code: draft ? draft.code : generateNextMerchCode(existingProducts),
          ...payload,
        };
      }

      onSaveProduct(savedProduct);
      resetForm();
      setSuccessMessage(
        draft
          ? `Producto actualizado (${savedProduct.code} · Stock: ${savedProduct.stock} uds).`
          : `Producto guardado (${savedProduct.code} · Stock: ${savedProduct.stock} uds).`,
      );
      if (draft) onFinishEditing?.();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar el producto.');
    } finally {
      setIsSaving(false);
    }
  };

  const previewStockBadge = getStockBadgeInfo(Number.isFinite(Number(stock)) ? Number(stock) : 0);

  return (
    <div ref={formContainerRef} className="border border-zinc-800 bg-[#0E0E12] p-6">
      <div className="mb-5 flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="font-display text-2xl font-black uppercase text-white">
            {draft ? 'Editar producto de mercancía' : 'Agregar mercancía'}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            {draft
              ? `Modificando ${draft.name} (${draft.code}). Actualiza precio, existencias o detalles.`
              : 'El producto y su inventario se guardarán en el catálogo de la tienda.'}
          </p>
        </div>
        <ShoppingBag className="h-5 w-5 text-[#DC2626]" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">Nombre</span>
            <input required maxLength={150} value={name} onChange={(event) => setName(event.target.value)} placeholder="Playera Time of Metal" className={fieldClassName} />
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">Categoría</span>
            <select value={category} onChange={(event) => setCategory(event.target.value as MerchCategory)} className={fieldClassName}>
              {MERCH_CATEGORIES.map((item) => <option key={item} value={item}>{categoryLabels[item]}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">Precio (MXN)</span>
            <input required type="number" min="0" max="1000000000" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="350.00" className={fieldClassName} />
          </label>

          <label className="block">
            <span className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              <span>Inventario / Stock (Unidades)</span>
              <span className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[9px] font-bold ${previewStockBadge.badgeClassName}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${previewStockBadge.dotClassName}`} />
                {previewStockBadge.label}
              </span>
            </span>
            <input
              required
              type="number"
              min="0"
              max="1000000"
              step="1"
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              placeholder="10"
              className={fieldClassName}
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">Enlace externo de compra (opcional)</span>
            <input type="url" maxLength={2048} value={purchaseUrl} onChange={(event) => setPurchaseUrl(event.target.value)} placeholder="https://tienda.ejemplo.com/producto" className={fieldClassName} />
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">
              {draft ? 'Reemplazar imagen (opcional; máx. 5 MB)' : 'Imagen (JPG, PNG, WebP o GIF; máx. 5 MB)'}
            </span>
            <input ref={imageInputRef} required={!draft} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} className={`${fieldClassName} file:mr-3 file:border-0 file:bg-zinc-800 file:px-3 file:py-1 file:font-mono file:text-[10px] file:uppercase file:text-white`} />
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">Estado</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as CmsPostStatus)} className={fieldClassName}>
              <option value="PUBLICADO">PUBLICADO</option>
              <option value="BORRADOR">BORRADOR</option>
              <option value="PROGRAMADO">PROGRAMADO</option>
            </select>
          </label>

          {status === 'PROGRAMADO' && (
            <label className="block">
              <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">Fecha y hora de publicación</span>
              <input required type="datetime-local" value={publishDate} onChange={(event) => setPublishDate(event.target.value)} className={fieldClassName} />
            </label>
          )}
        </div>

        {draft && (
          <div className="flex items-center gap-4 border border-zinc-800 bg-[#070709] p-3">
            <img src={draft.image} alt={draft.name} className="h-14 w-14 border border-zinc-800 object-cover" />
            <div className="font-mono text-xs text-zinc-400">
              <p className="font-bold text-white">{draft.name}</p>
              <p className="text-[10px] text-zinc-500">
                ID: {draft.id} · CÓDIGO: {draft.code} · {image ? 'Se usará la nueva imagen seleccionada' : 'Se conservará la imagen actual'}
              </p>
            </div>
          </div>
        )}

        <label className="block">
          <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">Descripción</span>
          <textarea maxLength={2000} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Detalles del producto, material o tallas disponibles" className={fieldClassName} />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="font-mono text-[11px]">
            {formError ? <span role="alert" className="font-bold text-red-300">{formError}</span>
              : successMessage ? <span role="status" className="font-bold text-emerald-400">{successMessage}</span>
                : null}
          </div>
          <div className="flex gap-2">
            {draft && (
              <button
                type="button"
                onClick={handleCancelEditing}
                disabled={isSaving}
                className="cursor-pointer border border-zinc-700 px-4 py-3 font-mono text-xs font-bold uppercase tracking-widest text-zinc-300 hover:text-white disabled:opacity-50"
              >
                CANCELAR
              </button>
            )}
            <button type="submit" disabled={isSaving} className="flex cursor-pointer items-center gap-2 bg-[#DC2626] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
              <Save className="h-4 w-4" /> {isSaving ? 'GUARDANDO…' : draft ? 'ACTUALIZAR PRODUCTO' : 'GUARDAR PRODUCTO'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PublishMerchForm;
