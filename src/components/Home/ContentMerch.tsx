import React, { useEffect, useState } from 'react';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import type { SectionId } from '../../data/mockData';
import type { CmsMerchProduct } from '../../data/CmsTypes';
import {
  getStockBadgeInfo,
  MERCH_UPDATED_EVENT,
  readStoredMerchCatalog,
} from '../../data/Merch';

interface ContentMerchProps {
  onSelectSection: (section: SectionId) => void;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);

export const ContentMerch: React.FC<ContentMerchProps> = ({ onSelectSection }) => {
  const [products, setProducts] = useState<CmsMerchProduct[]>(() => readStoredMerchCatalog());

  useEffect(() => {
    const handleMerchUpdated = (event: Event) => {
      const custom = event as CustomEvent<CmsMerchProduct[]>;
      if (Array.isArray(custom.detail)) {
        setProducts(custom.detail);
      } else {
        setProducts(readStoredMerchCatalog());
      }
    };

    window.addEventListener(MERCH_UPDATED_EVENT, handleMerchUpdated);
    return () => window.removeEventListener(MERCH_UPDATED_EVENT, handleMerchUpdated);
  }, []);

  const featuredProducts = products
    .filter((item) => item.status === 'PUBLICADO')
    .slice(0, 4);

  if (featuredProducts.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[#DC2626] block">
            ARSENAL OFICIAL · INVENTARIO EN TIEMPO REAL
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-black uppercase text-white mt-1 flex items-center gap-2.5">
            <ShoppingBag className="h-6 w-6 text-[#DC2626]" />
            MERCH OFICIAL DESTACADO
          </h2>
        </div>

        <button
          type="button"
          onClick={() => onSelectSection('merch')}
          className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wider text-zinc-300 hover:text-[#DC2626] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <span>IR A LA TIENDA COMPLETA</span>
          <ArrowRight className="h-4 w-4 text-[#DC2626]" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {featuredProducts.map((product) => {
          const badge = getStockBadgeInfo(product.stock);
          return (
            <article
              key={product.id}
              onClick={() => onSelectSection('merch')}
              className="group cursor-pointer flex flex-col justify-between border border-zinc-800 bg-[#0E0E12] hover:border-[#DC2626] transition-colors overflow-hidden"
            >
              <div className="relative aspect-square bg-[#070709] overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute left-3 top-3">
                  <span
                    className={`inline-flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[9px] font-bold uppercase ${badge.badgeClassName}`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${badge.dotClassName}`} />
                    {badge.label}
                  </span>
                </div>
              </div>

              <div className="p-4 flex flex-col justify-between flex-1 space-y-3">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#DC2626]">
                    {product.category}
                  </span>
                  <h3 className="font-display text-base font-bold uppercase text-white group-hover:text-[#DC2626] transition-colors mt-1 line-clamp-1">
                    {product.name}
                  </h3>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-800 pt-3 font-mono">
                  <span className="text-sm font-bold text-white">{formatPrice(product.price)}</span>
                  <span className="text-[10px] uppercase text-[#DC2626] font-bold">
                    Comprar →
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default ContentMerch;

