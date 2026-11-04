import { useMemo, useState } from 'react';
import { ExternalLink, PackageSearch, ShoppingBag } from 'lucide-react';
import type { CmsMerchProduct, MerchCategory } from '../../data/CmsTypes';
import { MERCH_CATEGORIES } from '../../data/CmsTypes';
import { ASSETS } from '../../data/Assets';

interface MerchCatalogProps {
  products: CmsMerchProduct[];
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

const MerchCatalog = ({ products }: MerchCatalogProps) => {
  const [selectedCategory, setSelectedCategory] = useState<MerchCategory | 'TODOS'>('TODOS');
  const visibleProducts = useMemo(
    () => products
      .filter((product) => product.status === 'PUBLICADO')
      .filter((product) => selectedCategory === 'TODOS' || product.category === selectedCategory),
    [products, selectedCategory],
  );

  return (
    <div className="min-h-screen bg-black text-[#F4F4F6]">
      <section className="mx-auto max-w-[1440px] px-4 pb-8 pt-12 lg:px-8">
        <div className="flex flex-col justify-between gap-6 border-b border-zinc-800 pb-8 sm:flex-row sm:items-end">
          <div>
            <img
              src={ASSETS.logoMerch}
              alt="Time of Metal Radio"
              className="w-full max-w-[320px] sm:max-w-[400px] h-auto object-contain"
            />
            <p className="mt-3 max-w-2xl text-sm text-zinc-400">
              Equípate para el próximo moshpit. Explora playeras, vasos, gorras y más.
            </p>
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-zinc-500">
            {visibleProducts.length} {visibleProducts.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-16 lg:px-8">
        <div className="mb-7 flex flex-wrap gap-2" aria-label="Filtrar por categoría">
          <button
            type="button"
            onClick={() => setSelectedCategory('TODOS')}
            aria-pressed={selectedCategory === 'TODOS'}
            className={`border px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${selectedCategory === 'TODOS'
                ? 'border-[#DC2626] bg-[#DC2626] text-white'
                : 'border-zinc-800 bg-[#0E0E12] text-zinc-400 hover:border-zinc-600 hover:text-white'
              }`}
          >
            Todo
          </button>
          {MERCH_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              aria-pressed={selectedCategory === category}
              className={`border px-4 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${selectedCategory === category
                  ? 'border-[#DC2626] bg-[#DC2626] text-white'
                  : 'border-zinc-800 bg-[#0E0E12] text-zinc-400 hover:border-zinc-600 hover:text-white'
                }`}
            >
              {categoryLabels[category]}
            </button>
          ))}
        </div>

        {visibleProducts.length ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <article key={product.id} className="group overflow-hidden border border-zinc-800 bg-[#0E0E12] transition-colors hover:border-zinc-600">
                <div className="aspect-square overflow-hidden bg-[#070709]">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#DC2626]">
                    {categoryLabels[product.category]}
                  </p>
                  <h2 className="mt-2 font-display text-lg font-bold uppercase text-white">{product.name}</h2>
                  {product.description && (
                    <p className="mt-2 line-clamp-3 min-h-[3.75rem] text-sm leading-relaxed text-zinc-400">
                      {product.description}
                    </p>
                  )}
                  <div className="mt-5 flex items-center justify-between gap-3 border-t border-zinc-800 pt-4">
                    <span className="font-mono text-lg font-bold text-white">{formatPrice(product.price)}</span>
                    {product.purchaseUrl ? (
                      <a
                        href={product.purchaseUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-[#DC2626] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider text-white transition-colors hover:bg-red-700"
                      >
                        Comprar <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <span className="font-mono text-[9px] uppercase tracking-wider text-zinc-500">Próximamente</span>
                    )}
                  </div>
                </div>
              </article>
            ))}
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
    </div>
  );
};

export default MerchCatalog;
