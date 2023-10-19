import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { googleTranslate } from '../utils/translation';
export const useTranslate = () => {
  // @ts-ignore
  const { googleProjectID } = useApplicationContext(
    (context) => context.environment
  );

  const translate = async (
    textToTranslate: string | string[],
    targetLanguage: string,
    sourceLanguage: string
  ) => {
    return await googleTranslate(
      textToTranslate,
      targetLanguage,
      sourceLanguage,
      googleProjectID
    );
  };

  return { translate };
};
