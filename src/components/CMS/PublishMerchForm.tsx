import { useRef, useState } from 'react';
import { Save, ShoppingBag } from 'lucide-react';
import { MERCH_CATEGORIES, type CmsMerchProduct, type CmsPostStatus, type MerchCategory } from '../../data/CmsTypes';
import { readJsonResponse } from '../../data/readJsonResponse';

interface PublishMerchFormProps {
  onSaveProduct: (product: CmsMerchProduct) => void;
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

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('No se pudo leer la imagen seleccionada.'));
        return;
      }
      resolve(reader.result.slice(reader.result.indexOf(',') + 1));
    };
    reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
    reader.readAsDataURL(file);
  });

const PublishMerchForm = ({ onSaveProduct }: PublishMerchFormProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MerchCategory>('PLAYERAS');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [purchaseUrl, setPurchaseUrl] = useState('');
  const [status, setStatus] = useState<CmsPostStatus>('PUBLICADO');
  const [publishDate, setPublishDate] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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
    if (!image) {
      setFormError('Selecciona una imagen del producto.');
      return;
    }
    if (status === 'PROGRAMADO' && !publishDate) {
      setFormError('Indica la fecha y hora de publicación programada.');
      return;
    }

    setIsSaving(true);
    setFormError(null);
    setSuccessMessage(null);
    try {
      const response = await fetch('/api/cms/merch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          category,
          description: description.trim(),
          price: Number(price),
          purchaseUrl: purchaseUrl.trim(),
          status,
          publish: status === 'PROGRAMADO' ? new Date(publishDate).toISOString() : '',
          productImage: { mimeType: image.type, data: await toBase64(image) },
        }),
      });
      const savedProduct = await readJsonResponse<CmsMerchProduct>(
        response,
        'No se pudo guardar el producto.',
      );
      onSaveProduct(savedProduct);
      setName('');
      setCategory('PLAYERAS');
      setDescription('');
      setPrice('');
      setPurchaseUrl('');
      setStatus('PUBLICADO');
      setPublishDate('');
      setImage(null);
      if (imageInputRef.current) imageInputRef.current.value = '';
      setSuccessMessage(`Producto guardado en post-merch.json (${savedProduct.code}).`);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo guardar el producto.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="border border-zinc-800 bg-[#0E0E12] p-6">
      <div className="mb-5 flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <h2 className="font-display text-2xl font-black uppercase text-white">Agregar mercancía</h2>
          <p className="mt-1 text-xs text-zinc-500">El producto se guardará en data/post-merch.json.</p>
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
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">Enlace de compra (opcional)</span>
            <input type="url" maxLength={2048} value={purchaseUrl} onChange={(event) => setPurchaseUrl(event.target.value)} placeholder="https://tienda.ejemplo.com/producto" className={fieldClassName} />
          </label>

          <label className="block">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-widest text-zinc-400">Imagen (JPG, PNG, WebP o GIF; máx. 5 MB)</span>
            <input ref={imageInputRef} required type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImageChange} className={`${fieldClassName} file:mr-3 file:border-0 file:bg-zinc-800 file:px-3 file:py-1 file:font-mono file:text-[10px] file:uppercase file:text-white`} />
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
          <button type="submit" disabled={isSaving} className="flex cursor-pointer items-center gap-2 bg-[#DC2626] px-6 py-3 font-mono text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50">
            <Save className="h-4 w-4" /> {isSaving ? 'GUARDANDO…' : 'GUARDAR PRODUCTO'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PublishMerchForm;
