/* eslint-disable @typescript-eslint/no-explicit-any */
import { cleanSlug } from '../../utils/slug';
import { useTranstale } from '../use-translate';

export const useTranslateProducts = () => {
  const { translate } = useTranstale();

  const translateProductsActions = async (
    products: any[],
    destLang: string,
    sourceLang: string
  ) => {
    const selectedProducts = products.filter((p) => p.checkbox);
    const translatableProducts = selectedProducts
      .map((p) => [
        p.name,
        p.description,
        p.slug,
        p.metaTitle,
        p.metaKeywords,
        p.metaDescription,
      ])
      .reduce((a, b) => a.concat(b), []);
    const translated: Record<'translatedText', string>[] = await translate(
      translatableProducts,
      destLang,
      sourceLang
    );

    const productUpdates: {
      id: string;
      version: number;
      actions: unknown[];
    }[] = [];
    const fieldsToAction = [
      {
        fieldName: 'name',
        actionName: 'changeName',
        allFields: 'nameAllLocales',
      },
      {
        fieldName: 'description',
        actionName: 'setDescription',
        allFields: 'descriptionAllLocales',
      },
      {
        fieldName: 'slug',
        actionName: 'changeSlug',
        allFields: 'slugAllLocales',
        transform: cleanSlug,
      },
      {
        fieldName: 'metaTitle',
        actionName: 'setMetaTitle',
        allFields: 'metaTitleAllLocales',
      },
      {
        fieldName: 'metaKeywords',
        actionName: 'setMetaKeywords',
        allFields: 'metaKeywordsAllLocales',
      },
      {
        fieldName: 'metaDescription',
        actionName: 'setMetaDescription',
        allFields: 'metaDescriptionAllLocales',
      },
    ];
    selectedProducts.forEach((p) => {
      const productUpdate: { id: string; version: number; actions: unknown[] } =
        {
          id: p.id,
          version: p.version,
          actions: [],
        };
      fieldsToAction.forEach((f) => {
        if (p[f.fieldName]) {
          const translatedText = translated.splice(0, 1)[0].translatedText;
          productUpdate.actions.push({
            [f.actionName]: {
              [f.fieldName]: [
                ...p[f.allFields].map((n: any) => ({
                  value: n.value,
                  locale: n.locale,
                })),
                {
                  value: f.transform
                    ? f.transform(translatedText)
                    : translatedText,
                  locale: destLang,
                },
              ],
            },
          });
        }
      });
      productUpdates.push(productUpdate);
    });
    return productUpdates;
  };

  return { translateProductsActions };
};
