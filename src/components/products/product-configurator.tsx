import React, { useMemo, useState } from 'react';
import { useIntl } from 'react-intl';
import SelectField from '@commercetools-uikit/select-field';
import Spacings from '@commercetools-uikit/spacings';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import Label from '@commercetools-uikit/label';
import messages from './messages';
import { TFetchProductsQuery } from '../../hooks/use-products-connector';
import ProductTranslator from './product-translator';
import {
  TFieldAction,
  translatableProductFieldsToAction,
} from '../../hooks/use-products-connector/translate-products';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import Styles from './products.module.css';

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

  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const { projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages,
  }));

  const handleFieldChange = (isChecked: boolean, fieldName: string) => {
    if (isChecked) {
      setSelectedFields((prev) => [...prev, fieldName]);
    } else {
      setSelectedFields((prev) => prev.filter((f) => f !== fieldName));
    }
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      setSelectedFields(
        translatableProductFieldsToAction.map((f) => f.fieldName)
      );
    } else {
      setSelectedFields([]);
    }
  };

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
      <div>
        <Label isBold={false}>{intl.formatMessage(messages.fields)}</Label>
        <div className={Styles.fieldsWrapper}>
          <CheckboxInput
            onChange={(e) => handleSelectAll(e.target.checked)}
            isChecked={
              selectedFields.length === translatableProductFieldsToAction.length
            }
          >
            {intl.formatMessage(messages.selectAll)}
          </CheckboxInput>
          {translatableProductFieldsToAction.map((f) => (
            <CheckboxInput
              key={f.fieldName}
              onChange={(e) => handleFieldChange(e.target.checked, f.fieldName)}
              isChecked={selectedFields.includes(f.fieldName)}
            >
              {f.label}
            </CheckboxInput>
          ))}
        </div>
      </div>

      <ProductTranslator
        products={products}
        selectedFieldsToTranslate={selectedFields.map(
          (v) =>
            translatableProductFieldsToAction.find(
              (f) => f.fieldName === v
            ) as TFieldAction
        )}
        destLang={destLang}
        sourceLang={sourceLang}
      />
    </Spacings.Stack>
  );
};

export default ProductConfigurator;
