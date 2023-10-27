/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  useMcMutation,
  useMcQuery,
} from '@commercetools-frontend/application-shell';
import FetchTranslationMemory from './fetch-translation-memory.ctp.graphql';
import UpdateTranslationMemoryMutation from './update-translation-memory.ctp.graphql';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { GRAPHQL_TARGETS } from '@commercetools-frontend/constants';
import { escapedJSON, getTranslationKey } from '../../utils/memory';
import { useEffect, useState } from 'react';

interface TFetchTranslationMemoryQueryVariables {
  container: string;
  key: string;
}

interface TTranslationMemoryMutationVariables
  extends TFetchTranslationMemoryQueryVariables {
  value: string;
}

interface TFetchTranslationMemoryQuery {
  __typename?: 'Query';
  customObject: {
    version: number;
    value: Record<string, unknown>;
  } | null;
}

interface TTranslationMemoryMutation {
  __typename?: 'Mutation';
  createOrUpdateCustomObject: {
    version: number;
    value: Record<string, unknown>;
  } | null;
}
export const useTranslationMemory = () => {
  const [memory, setMemory] = useState<Record<string, any>>();
  // @ts-ignore
  const { translationMemoryObjectKey, translationMemoryContainer } =
    useApplicationContext((context) => context.environment);
  const { data } = useMcQuery<
    TFetchTranslationMemoryQuery,
    TFetchTranslationMemoryQueryVariables
  >(FetchTranslationMemory, {
    variables: {
      container: translationMemoryContainer,
      key: translationMemoryObjectKey,
    },
    context: {
      target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
    },
  });

  const [updateMemory] = useMcMutation<
    TTranslationMemoryMutation,
    TTranslationMemoryMutationVariables
  >(UpdateTranslationMemoryMutation);

  const memoryHit = (
    text: string[],
    sourceLang: string,
    targetLang: string
  ): { text: string; hit: boolean }[] => {
    const memoryHits = text.map((t) => {
      if (t) {
        const key = getTranslationKey(sourceLang, targetLang, t);
        return {
          text: (memory?.[key] as string) || t,
          hit: !!memory?.[key],
        };
      }
      return {
        text: '',
        hit: false,
      };
    });
    return memoryHits;
  };
  const memorize = async (
    texts: string[],
    sourceLang: string,
    targetLang: string,
    values: string[]
  ) => {
    const newMemory: Record<string, string> = {};
    texts.forEach((t, i) => {
      const key = getTranslationKey(sourceLang, targetLang, t);
      newMemory[key] = values[i];
    });
    const variables = {
      container: translationMemoryContainer,
      key: translationMemoryObjectKey,
      value: escapedJSON({
        ...memory,
        ...newMemory,
      }),
    };

    const result = await updateMemory({
      context: {
        target: GRAPHQL_TARGETS.COMMERCETOOLS_PLATFORM,
      },
      variables,
    });

    // update memory
    setMemory(result.data?.createOrUpdateCustomObject?.value);
  };

  useEffect(() => {
    setMemory(data?.customObject?.value);
  }, [data]);

  return {
    memoryHit,
    memorize,
  };
};
