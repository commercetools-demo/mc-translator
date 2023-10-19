import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { googleTranslate } from '../utils/translation';
export const useTranslate = () => {
  // @ts-ignore
  const { translateApiKey } = useApplicationContext(
    (context) => context.environment
  );

  const translate = async (
    textToTranslate: string | string[],
    targetLanguage: string
  ) => {
    return await googleTranslate(
      textToTranslate,
      targetLanguage,
      translateApiKey
    );
  };

  return { translate };
};
