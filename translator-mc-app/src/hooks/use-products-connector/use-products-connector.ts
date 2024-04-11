/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference path="../../../@types/commercetools__sync-actions/index.d.ts" />

import type { ApolloError } from '@apollo/client';
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import FetchProductsQuery from './fetch-products.ctp.graphql';
import UpdateProductMutation from './update-products.ctp.graphql';
import { TDataTableSortingState } from '@commercetools-uikit/hooks';
import { extractErrorFromGraphQlResponse } from '../../helpers';
import { useEffect } from 'react';
import { Product } from '@commercetools/platform-sdk';

type TProductNode = {
  [P in keyof Product]: string;
}

export interface Variant {
  __typename?: 'ProductVariant';
  id: string;
  sku: string;
  key: string;
  attributesRaw: Array<{
    name: string;
    value: string | Record<string, string>;
  }>
}

export interface TFetchProductItem {
  __typename?: 'Product';
  version: number;
  id: string;
  key: string;
  name: string;
  dstName: string;
  description: string;
  slug: string;
  metaTitle: string;
  metaKeywords: string;
  metaDescription: string;
  masterVariant: Variant;
  variants: Array<Variant>;
}

export type TFetchProductsQuery = {
  __typename?: 'Query';
  productProjectionSearch: {
    __typename?: 'ProductProjectionSearchQueryResult';
    total: number;
    count: number;
    offset: number;
    results: Array<TFetchProductItem>;
  };
};

export type TUpdateProductMutationVariables = {
  productId: string;
  version: number;
  actions: Array<any>;
};

export type TUpdateProductMutation = {
  __typename?: 'Mutation';
  updateProduct?: {
    __typename?: 'Product';
    id: string;
    version: number;
    key: string;
  } | null;
};

export type PaginationAndSortingProps = {
  page: { value: number };
  perPage: { value: number };
  tableSorting: TDataTableSortingState;
};
type TUseProductsFetcher = (
  paginationAndSortingProps: PaginationAndSortingProps & {
    srcLocale?: string;
    dstLocale?: string;
    staged?: boolean;
  }
) => {
  productsPaginatedResult?: TFetchProductsQuery['productProjectionSearch'];
  error?: ApolloError;
  loading: boolean;
};

export type TFetchProductsQueryVariables = {
  limit: number;
  offset: number;
  sorts?: Array<string> | string;
  srcLocale?: string;
  dstLocale?: string;
  staged?: boolean;
};

export const useProductsFetcher: TUseProductsFetcher = ({
  srcLocale,
  dstLocale,
  staged,
  page,
  perPage,
  tableSorting,
}) => {
  const { data, error, loading, refetch } = useMcQuery<
    TFetchProductsQuery,
    TFetchProductsQueryVariables
  >(FetchProductsQuery, {
    variables: {
      limit: perPage.value,
      offset: (page.value - 1) * perPage.value,
      sorts: [`${tableSorting.value.key} ${tableSorting.value.order}`],
      srcLocale,
      dstLocale,
      staged,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  console.log(data?.productProjectionSearch?.results?.[0]?.masterVariant?.sku);
  console.log(data?.productProjectionSearch?.results?.[3]?.masterVariant?.sku);
  

  useEffect(() => {
    refetch();
  }, [staged]);

  return {
    productsPaginatedResult: data?.productProjectionSearch,
    error,
    loading,
  };
};

export const useProductUpdater = () => {
  const [updateProduct, { loading }] = useMcMutation<
    TUpdateProductMutation,
    TUpdateProductMutationVariables
  >(UpdateProductMutation);

  const execute = async ({
    originalDraft,
    actions,
  }: {
    originalDraft: { id: string; version: number };
    actions: unknown[];
  }) => {
    try {
      return await updateProduct({
        context: {
          target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
        },
        variables: {
          productId: originalDraft.id,
          version: originalDraft.version,
          actions,
        },
      });
    } catch (graphQlResponse) {
      throw extractErrorFromGraphQlResponse(graphQlResponse);
    }
  };

  return {
    loading,
    execute,
  };
};
