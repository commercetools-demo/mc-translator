import React, { useMemo } from 'react';
import { useIntl } from 'react-intl';
import SelectField from '@commercetools-uikit/select-field';
import Spacings from '@commercetools-uikit/spacings';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import messages from './messages';
import { TFetchProductsQuery } from '../../hooks/use-products-connector';
import ProductTranslator from './product-translator';

type Props = {
  sourceLang?: string;
  destLang?: string;
  onSourceLangChange: (sourceLang: string) => void;
  onDestLangChange: (destLang: string) => void;
  products: TFetchProductsQuery['productProjectionSearch']['results'];
};

const ProductConfigurator: React.FC<Props> = ({
  products,
  sourceLang,
  destLang,
  onDestLangChange,
  onSourceLangChange,
}) => {
  const intl = useIntl();

  const { projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages,
  }));

  const languageOptions = useMemo(
    () => projectLanguages?.map((l) => ({ label: l, value: l })),
    [projectLanguages]
  );

  return (
    <Spacings.Stack scale="s" alignItems={'stretch'}>
      <SelectField
        title={intl.formatMessage(messages.sourceLang)}
        options={languageOptions}
        onChange={(e) => onSourceLangChange(e.target.value as string)}
        value={sourceLang}
      />
      <SelectField
        title={intl.formatMessage(messages.destLang)}
        options={languageOptions}
        onChange={(e) => onDestLangChange(e.target.value as string)}
        value={destLang}
      />
      <ProductTranslator products={products} destLang={destLang} />
    </Spacings.Stack>
  );
};

export default ProductConfigurator;
