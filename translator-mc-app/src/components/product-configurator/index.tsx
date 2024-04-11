import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import SelectField from '@commercetools-uikit/select-field';
import Spacings from '@commercetools-uikit/spacings';
import React, { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import { TFetchProductsQuery } from '../../hooks/use-products-connector';
import {
  TFieldAction,
} from '../../hooks/use-products-connector/translate-products';
import messages from '../products/messages';
import ProductTranslator from '../products/product-translator';
import AttributeList from './components/attribute-list';
import FieldsList from './components/fields-list';
import { TAttributeDefinition } from '../../hooks/use-product-types-connector/use-product-types-connector';
import { TFetchProductItem } from '../../hooks/use-products-connector/use-products-connector';

type Props = {
  sourceLang?: string;
  destLang?: string;
  staged?: boolean;
  onSourceLangChange: (sourceLang: string) => void;
  onDestLangChange: (destLang: string) => void;
  onStagedChange: (value: boolean) => void;
  products: Array<TFetchProductItem & {[key: string]: boolean}>;
};

const ProductConfigurator: React.FC<Props> = ({
  products,
  sourceLang,
  destLang,
  staged,
  onStagedChange,
  onDestLangChange,
  onSourceLangChange,
}) => {
  const intl = useIntl();

  const [selectedFields, setSelectedFields] = useState<TFieldAction[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<TAttributeDefinition[]>([]);

  const { projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages,
  }));

  const languageOptions = useMemo(
    () => projectLanguages?.map((l) => ({ label: l, value: l })),
    [projectLanguages]
  );

  return (
    <Spacings.Stack scale="m" alignItems={'stretch'}>
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
      <FieldsList
        selectedFields={selectedFields}
        onUpdateSelectedFields={setSelectedFields}
      />
      <AttributeList
        selectedFields={selectedAttributes}
        onUpdateSelectedFields={setSelectedAttributes}
      />
      <CheckboxInput
        onChange={(e) => onStagedChange(e.target.checked)}
        isChecked={staged}
      >
        {intl.formatMessage(messages.staged)}
      </CheckboxInput>
      <ProductTranslator
        products={products}
        selectedFieldsToTranslate={selectedFields}
        selectedAttributesToTranslate={selectedAttributes}
        destLang={destLang}
        sourceLang={sourceLang}
      />
    </Spacings.Stack>
  );
};

export default ProductConfigurator;
