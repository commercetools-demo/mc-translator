import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { TRow } from '@commercetools-uikit/data-table';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { ContentNotification } from '@commercetools-uikit/notifications';
import {
  TFetchProductsQuery,
  useProductUpdater,
} from '../../hooks/use-products-connector/use-products-connector';
import { useTranslateProducts } from '../../hooks/use-products-connector';
import messages from './messages';

type Props = {
  products: TFetchProductsQuery['productProjectionSearch']['results'];
  destLang?: string;
};

const ProductTranslator: React.FC<Props> = ({ products, destLang }) => {
  const intl = useIntl();

  const [isLoading, setIsLoading] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const productUpdater = useProductUpdater();
  const { translateProductsActions } = useTranslateProducts();

  const onTranslateProducts = async (rows: Array<TRow>) => {
    setIsLoading(true);
    const translatedProductsActions = await translateProductsActions(
      rows,
      destLang!
    );

    for await (const product of translatedProductsActions) {
      await productUpdater.execute({
        originalDraft: { id: product.id, version: product.version },
        actions: product.actions,
      });
    }
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
