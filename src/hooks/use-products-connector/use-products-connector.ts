/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference path="../../../@types/commercetools__sync-actions/index.d.ts" />
/// <reference path="../../../@types-extensions/graphql-ctp/index.d.ts" />

import type { ApolloError } from '@apollo/client';
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import type { Exact, InputMaybe, Scalars } from '../../types/generated/ctp';
import FetchProductsQuery from './fetch-products.ctp.graphql';
import UpdateProductMutation from './update-products.ctp.graphql';
import { TDataTableSortingState } from '@commercetools-uikit/hooks';
import { extractErrorFromGraphQlResponse } from '../../helpers';

export type TFetchProductsQuery = {
  __typename?: 'Query';
  productProjectionSearch: {
    __typename?: 'ProductProjectionSearchQueryResult';
    total: number;
    count: number;
    offset: number;
    results: Array<{
      __typename?: 'Product';
      version: number;
      id: string;
      key: string;
      name: string;
      dstName: string;
    }>;
  };
};

export type TUpdateProductMutationVariables = Exact<{
  productId: Scalars['String'];
  version: Scalars['Long'];
  actions: Array<any>;
}>;

export type TUpdateProductMutation = {
  __typename?: 'Mutation';
  updateProduct?: {
    __typename?: 'Product';
    id: string;
    version: number;
    key: string;
  } | null;
};

type PaginationAndSortingProps = {
  page: { value: number };
  perPage: { value: number };
  tableSorting: TDataTableSortingState;
};
type TUseProductsFetcher = (
  paginationAndSortingProps: PaginationAndSortingProps & {
    srcLocale?: string;
    dstLocale?: string;
  }
) => {
  productsPaginatedResult?: TFetchProductsQuery['productProjectionSearch'];
  error?: ApolloError;
  loading: boolean;
};

export type TFetchProductsQueryVariables = Exact<{
  limit: Scalars['Int'];
  offset: Scalars['Int'];
  sorts?: InputMaybe<Array<Scalars['String']> | Scalars['String']>;
  srcLocale?: Scalars['String'];
  dstLocale?: Scalars['String'];
}>;

export const useProductsFetcher: TUseProductsFetcher = ({
  srcLocale,
  dstLocale,
  page,
  perPage,
  tableSorting,
}) => {
  const { data, error, loading } = useMcQuery<
    TFetchProductsQuery,
    TFetchProductsQueryVariables
  >(FetchProductsQuery, {
    variables: {
      limit: perPage.value,
      offset: (page.value - 1) * perPage.value,
      sorts: [`${tableSorting.value.key} ${tableSorting.value.order}`],
      srcLocale,
      dstLocale,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

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
