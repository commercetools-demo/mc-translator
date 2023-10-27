import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import { googleTranslate } from '../utils/translation';
import { useTranslationMemory } from './use-translation-memory/use-translation-memory';
export const useTranslate = () => {
  // @ts-ignore
  const { translateApiKey } = useApplicationContext(
    (context) => context.environment
  );

  const { memoryHit, memorize } = useTranslationMemory();

  const translate = async (
    textToTranslate: string[],
    targetLanguage: string,
    sourceLanguage: string
  ): Promise<{ translatedText: string; detectedSourceLanguage?: string }[]> => {
    const memoryHitResult = memoryHit(
      textToTranslate,
      sourceLanguage,
      targetLanguage
    );

    let translated: { translatedText: string }[] = [];
    // Items not found in memory
    const toTranslateTexts = memoryHitResult
      .filter((item) => !item.hit && item.text)
      .map((item) => item.text);
    if (toTranslateTexts.length) {
      translated = await googleTranslate(
        toTranslateTexts,
        targetLanguage,
        translateApiKey
      );

      memorize(
        toTranslateTexts,
        sourceLanguage,
        targetLanguage,
        translated.map((t) => t.translatedText)
      );
    }

    // Put items from memory and translated texts in right order
    let missingIndex = -1;
    const result = memoryHitResult.map((item, i) => {
      if (item.hit) {
        return { translatedText: item.text };
      } else {
        missingIndex++;
        return translated[missingIndex];
      }
    });

    return result.filter((item) => item);
  };

  return { translate };
};
