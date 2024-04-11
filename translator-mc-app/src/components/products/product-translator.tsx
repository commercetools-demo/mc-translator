import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { TRow } from '@commercetools-uikit/data-table';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { ContentNotification } from '@commercetools-uikit/notifications';
import {
  TFetchProductItem,
  TFetchProductsQuery,
  useProductUpdater,
} from '../../hooks/use-products-connector/use-products-connector';
import { useTranslateProducts } from '../../hooks/use-products-connector';
import messages from './messages';
import { TFieldAction } from '../../hooks/use-products-connector/translate-products';
import { TAttributeDefinition } from '../../hooks/use-product-types-connector/use-product-types-connector';
import { useTranslateAttributes } from '../../hooks/use-product-types-connector';

type Props = {
  products: TFetchProductItem[];
  selectedFieldsToTranslate: TFieldAction[];
  selectedAttributesToTranslate: TAttributeDefinition[];
  destLang?: string;
  sourceLang?: string;
};

const ProductTranslator: React.FC<Props> = ({
  products,
  selectedFieldsToTranslate,
  selectedAttributesToTranslate,
  destLang,
  sourceLang,
}) => {
  const intl = useIntl();

  const [isLoading, setIsLoading] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const productUpdater = useProductUpdater();
  const { translateProductsActions } = useTranslateProducts();
  const { translateAttributesActions } = useTranslateAttributes();
  const translateProductFields = async (rows: Array<TFetchProductItem & {[key: string]: boolean}>) => {
    const translatedProductsActions = await translateProductsActions(
      rows,
      selectedFieldsToTranslate,
      destLang!,
      sourceLang!
    );

    for await (const product of translatedProductsActions) {
      await productUpdater.execute({
        originalDraft: { id: product.id, version: product.version },
        actions: product.actions,
      });
    }
  };
  const translateProductAttributes = async (rows: Array<TRow>) => {
    const translatedProductsActions = await translateAttributesActions(
      rows,
      selectedAttributesToTranslate,
      destLang!,
      sourceLang!
    );

    console.log(translatedProductsActions);
    

    // for await (const product of translatedProductsActions) {
    //   await productUpdater.execute({
    //     originalDraft: { id: product.id, version: product.version },
    //     actions: product.actions,
    //   });
    // }
  };
  const onTranslateProducts = async (rows: Array<TFetchProductItem>) => {
    setIsLoading(true);
    // await translateProductFields(rows);
    await translateProductAttributes(rows);
    setIsLoading(false);
    setIsTranslated(true);
  };
  useEffect(() => {
    if (isTranslated) {
      setTimeout(() => {
        setIsTranslated(false);
      }, 10000);
    }
  }, [isTranslated]);

  return (
    <div>
      {!isTranslated && (
        <SecondaryButton
          label="translate"
          disabled={isLoading || !products.length}
          iconLeft={isLoading ? <LoadingSpinner scale={'s'} /> : undefined}
          onClick={() => onTranslateProducts(products)}
        />
      )}
      {isTranslated && (
        <ContentNotification type="success">
          {intl.formatMessage(messages.translated)}
        </ContentNotification>
      )}
    </div>
  );
};

export default ProductTranslator;
