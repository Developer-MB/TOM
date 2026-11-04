import { useEffect, useState } from 'react';
import MerchCatalog from '../components/Merch/MerchCatalog';
import { INITIAL_CMS_MERCH } from '../data/Merch';
import type { CmsMerchProduct } from '../data/CmsTypes';
import { readJsonResponseOrFallback } from '../data/readJsonResponse';

const MerchSection = () => {
  const [products, setProducts] = useState<CmsMerchProduct[]>(INITIAL_CMS_MERCH);

  useEffect(() => {
    const controller = new AbortController();
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/cms/merch', { signal: controller.signal });
        const savedProducts = await readJsonResponseOrFallback<unknown>(
          response,
          'No se pudieron cargar los productos.',
          INITIAL_CMS_MERCH,
        );
        if (!Array.isArray(savedProducts)) {
          throw new Error('El servidor devolvió un catálogo de mercancía no válido.');
        }
        setProducts(savedProducts as CmsMerchProduct[]);
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error('No se pudo actualizar el catálogo de mercancía:', error);
      }
    };

    void loadProducts();
    return () => controller.abort();
  }, []);

  return <MerchCatalog products={products} />;
};

export default MerchSection;
