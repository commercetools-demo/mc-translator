/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference path="../../../@types/commercetools__sync-actions/index.d.ts" />

import type { ApolloError } from '@apollo/client';
import { useMcQuery } from '@commercetools-frontend/application-shell';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import type { Exact } from '../../types/generated/ctp';
import FetchProductTypesQuery from './fetch-product-types.ctp.graphql';

export interface TAttributeDefinition {
  __typename?: 'AttributeDefinition';
  name: string;
  label?: string;
  type: {
    name: string;
  };
}

export interface TProductTypeResultItem {
  __typename?: 'ProductTypeDefinition';
  version: number;
  id: string;
  key: string;
  name: string;
  attributeDefinitions: {
    results: Array<TAttributeDefinition>;
  };
}

interface TProductTypesQuery {
  __typename?: 'ProductTypeDefinitionQueryResult';
  total: number;
  count: number;
  offset: number;
  results: Array<TProductTypeResultItem>;
}

export type TFetchProductTypesQuery = {
  __typename?: 'Query';
  productTypes: TProductTypesQuery;
};

type TUseProductTypesFetcher = () => {
  productTypesPaginatedResult?: TProductTypesQuery;
  error?: ApolloError;
  loading: boolean;
};

export type TFetchProductTypesQueryVariables = Exact<{
  limit: number;
  offset: number;
  sorts?: string[] | string;
}>;

export const useProductTypesFetcher: TUseProductTypesFetcher = () => {
  const { data, error, loading } = useMcQuery<
    TFetchProductTypesQuery,
    TFetchProductTypesQueryVariables
  >(FetchProductTypesQuery, {
    variables: {
      limit: 500,
      offset: 0,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  return {
    productTypesPaginatedResult: data?.productTypes,
    error,
    loading,
  };
};
