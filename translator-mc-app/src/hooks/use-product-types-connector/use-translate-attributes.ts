/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  TFetchProductItem,
  Variant,
} from '../use-products-connector/use-products-connector';
import { useTranslate } from '../use-translate';
import { TAttributeDefinition } from './use-product-types-connector';

export interface TFieldAction {
  label: string;
  fieldName: string;
  actionName: string;
  allFields: string;
  transform?: (text: string) => string;
}

export const useTranslateAttributes = () => {
  const { translate } = useTranslate();

  const translateAttributesActions = async (
    products: Array<TFetchProductItem & { [key: string]: boolean }>,
    attributesToTranslate: TAttributeDefinition[],
    destLang: string,
    sourceLang: string
  ) => {
    const selectedProducts = products.filter((p) => p.checkbox);

    console.log(selectedProducts, attributesToTranslate, destLang, sourceLang);
    const attributeNames = attributesToTranslate.map((a) => a.name);

    const allVariants: (Variant & { productId: string; version: number })[] =
      [];
    selectedProducts.forEach((p) => {
      allVariants.push({
        ...p.masterVariant,
        productId: p.id,
        version: p.version,
      });
      allVariants.push(
        ...p.variants.map((v) => ({ ...v, productId: p.id, version: p.version }))
      );
    });

    const translatableVariants = allVariants.map((v) => ({
      ...v,
      attributesRaw: v.attributesRaw.filter((a) =>
        attributeNames.includes(a.name)
      ),
    }));

    const translatableTexts = translatableVariants.reduce(
      (a, b) => a.concat(b.attributesRaw.map((att) => att.value[sourceLang])),
      []
    );

    
    const translated: Record<'translatedText', string>[] = await translate(
      translatableTexts,
      destLang,
      sourceLang
    );

    const productUpdates: any = [];

    translatableVariants.forEach((v) => {
      console.log('variant',v);
      
      const variantUptdate:{ id: string; version: number; actions: unknown[] } = {
        id: v.productId,
        version: v.version,
        actions: [],
      };

      attributeNames.forEach((a) => {
        const attributeValue = v.attributesRaw.find((att) => att.name === a)?.value as Record<string, string>;
        if (!attributeValue) {
          return;
        }
        variantUptdate.actions.push({
          action: "setAttribute",
          sku: v.sku,
          name: a,
          value: {
            ...attributeValue,
            [destLang]: translated.splice(0, 1)[0].translatedText,
          }
        })
      })
      productUpdates.push(variantUptdate);
    });

    // selectedProducts.forEach((p) => {
    //   const productUpdate: { id: string; version: number; actions: unknown[] } =
    //     {
    //       id: p.id,
    //       version: p.version,
    //       actions: [],
    //     };
    //   fieldsToTranslate.forEach((f) => {
    //     if (p[f.fieldName]) {
    //       const translatedText = translated.splice(0, 1)[0].translatedText;
    //       productUpdate.actions.push({
    //         [f.actionName]: {
    //           [f.fieldName]: [
    //             ...p[f.allFields].map((n: any) => ({
    //               value: n.value,
    //               locale: n.locale,
    //             })),
    //             {
    //               value: f.transform
    //                 ? f.transform(translatedText)
    //                 : translatedText,
    //               locale: destLang,
    //             },
    //           ],
    //         },
    //       });
    //     }
    //   });
    //   productUpdates.push(productUpdate);
    // });
    return productUpdates;
  };

  return { translateAttributesActions };
};
