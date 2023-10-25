/* eslint-disable @typescript-eslint/no-explicit-any */
import { cleanSlug } from '../../utils/slug';
import { useTranslate } from '../use-translate';

export interface TFieldAction {
  label: string;
  fieldName: string;
  actionName: string;
  allFields: string;
  transform?: (text: string) => string;
}

export const translatableProductFieldsToAction: TFieldAction[] = [
  {
    label: 'Name',
    fieldName: 'name',
    actionName: 'changeName',
    allFields: 'nameAllLocales',
  },
  {
    label: 'Description',
    fieldName: 'description',
    actionName: 'setDescription',
    allFields: 'descriptionAllLocales',
  },
  {
    label: 'Slug',
    fieldName: 'slug',
    actionName: 'changeSlug',
    allFields: 'slugAllLocales',
    transform: cleanSlug,
  },
  {
    label: 'Meta Title',
    fieldName: 'metaTitle',
    actionName: 'setMetaTitle',
    allFields: 'metaTitleAllLocales',
  },
  {
    label: 'Meta Keywords',
    fieldName: 'metaKeywords',
    actionName: 'setMetaKeywords',
    allFields: 'metaKeywordsAllLocales',
  },
  {
    label: 'Meta Description',
    fieldName: 'metaDescription',
    actionName: 'setMetaDescription',
    allFields: 'metaDescriptionAllLocales',
  },
];

export const useTranslateProducts = () => {
  const { translate } = useTranslate();

  const translateProductsActions = async (
    products: any[],
    fieldsToTranslate: TFieldAction[],
    destLang: string,
    sourceLang: string
  ) => {
    const selectedProducts = products.filter((p) => p.checkbox);
    const translatableProducts = selectedProducts
      .map((p) =>
        fieldsToTranslate
          .filter((f) => p[f.fieldName])
          .map((f) => p[f.fieldName])
      )
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

    selectedProducts.forEach((p) => {
      const productUpdate: { id: string; version: number; actions: unknown[] } =
        {
          id: p.id,
          version: p.version,
          actions: [],
        };
      fieldsToTranslate.forEach((f) => {
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
