import React from 'react';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import Label from '@commercetools-uikit/label';
import { useIntl } from 'react-intl';
import messages from '../../products/messages';
import Styles from '../product-configurator.module.css';
import {
  TFieldAction,
  translatableProductFieldsToAction,
} from '../../../hooks/use-products-connector/translate-products';

type Props = {
  selectedFields: TFieldAction[];
  onUpdateSelectedFields: (selectedFields: TFieldAction[]) => void;
};

const FieldsList: React.FC<Props> = ({
  selectedFields,
  onUpdateSelectedFields,
}) => {
  const intl = useIntl();

  const handleFieldChange = (isChecked: boolean, fieldName: string) => {
    if (isChecked) {
      const field = translatableProductFieldsToAction.find(
        (f) => f.fieldName === fieldName
      );
      if (field) {
        onUpdateSelectedFields(selectedFields.concat(field));
      }
    } else {
      onUpdateSelectedFields(
        selectedFields.filter((f) => f.fieldName !== fieldName)
      );
    }
  };

  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      onUpdateSelectedFields(translatableProductFieldsToAction);
    } else {
      onUpdateSelectedFields([]);
    }
  };
  return (
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
            isChecked={!!selectedFields.find((item) => item.fieldName === f.fieldName)}
          >
            {f.label}
          </CheckboxInput>
        ))}
      </div>
    </div>
  );
};

export default FieldsList;
