import { useEffect, useState } from 'react';
import MerchCatalog from '../components/Merch/MerchCatalog';
import {
  MERCH_UPDATED_EVENT,
  normalizeMerchProduct,
  readStoredMerchCatalog,
  writeStoredMerchCatalog,
} from '../data/Merch';
import type { CmsMerchProduct } from '../data/CmsTypes';
import { readJsonResponseOrFallback } from '../data/readJsonResponse';

const MerchSection = () => {
  const [products, setProducts] = useState<CmsMerchProduct[]>(() => readStoredMerchCatalog());

  useEffect(() => {
    const syncFromStorage = () => {
      setProducts(readStoredMerchCatalog());
    };
    window.addEventListener(MERCH_UPDATED_EVENT, syncFromStorage);
    window.addEventListener('storage', syncFromStorage);
    return () => {
      window.removeEventListener(MERCH_UPDATED_EVENT, syncFromStorage);
      window.removeEventListener('storage', syncFromStorage);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const loadProducts = async () => {
      try {
        const localCatalog = readStoredMerchCatalog();
        const response = await fetch('/api/home/merch', { signal: controller.signal });
        const savedProducts = await readJsonResponseOrFallback<unknown>(
          response,
          'No se pudieron cargar los productos.',
          localCatalog,
        );
        if (!Array.isArray(savedProducts)) {
          throw new Error('El servidor devolvió un catálogo de mercancía no válido.');
        }
        const normalized = (savedProducts as CmsMerchProduct[]).map(normalizeMerchProduct);
        setProducts(normalized);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('No se pudo actualizar el catálogo de mercancía:', error);
      }
    };

    void loadProducts();
    return () => controller.abort();
  }, []);

  const handleUpdateProducts = (nextProducts: CmsMerchProduct[]) => {
    setProducts(nextProducts);
    writeStoredMerchCatalog(nextProducts);
  };

  return (
    <MerchCatalog
      products={products}
      onUpdateProducts={handleUpdateProducts}
    />
  );
};

export default MerchSection;
