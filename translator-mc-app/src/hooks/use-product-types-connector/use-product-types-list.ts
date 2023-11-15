import { useEffect, useState } from 'react';
import {
  TFetchProductTypesQuery,
  useProductTypesFetcher,
} from './use-product-types-connector';
const useProductTypesList = () => {
  const { loading, productTypesPaginatedResult } = useProductTypesFetcher();
  const [translatableProductTypes, setTranslatableProductTypes] =
    useState<TFetchProductTypesQuery['productTypesSearch']['results']>([]);
  useEffect(() => {
    console.log(productTypesPaginatedResult);
    
    if (productTypesPaginatedResult?.results?.length) {
      setTranslatableProductTypes(
        productTypesPaginatedResult?.results.map((item) => ({
          ...item,
          attributeDefinitions: {
            results: item.attributeDefinitions.results.filter((item) =>
              ['ltext'].includes(item.type.name)
            ),
          },
        })).filter((item) => item.attributeDefinitions.results.length)
      );
    }
  }, [productTypesPaginatedResult]);
  return { translatableProductAttributes: translatableProductTypes, loading };
};

export { useProductTypesList };
