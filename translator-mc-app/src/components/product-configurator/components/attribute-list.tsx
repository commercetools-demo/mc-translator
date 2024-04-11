import React, { useEffect, useState } from 'react';
import { useProductTypesList } from '../../../hooks/use-product-types-connector';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import Label from '@commercetools-uikit/label';
import { useIntl } from 'react-intl';
import messages from '../../products/messages';
import Styles from '../product-configurator.module.css';
import { TAttributeDefinition } from '../../../hooks/use-product-types-connector/use-product-types-connector';

type Props = {
  selectedFields: TAttributeDefinition[];
  onUpdateSelectedFields: (selectedFields: TAttributeDefinition[]) => void;
};

const AttributeList: React.FC<Props> = ({
  selectedFields,
  onUpdateSelectedFields,
}) => {
  const { translatableProductAttributes } = useProductTypesList();
  const intl = useIntl();
  const [flattenAttributes, setflattenAttributes] = useState<
    TAttributeDefinition[]
  >([]);

  const handleFieldChange = (isChecked: boolean, fieldName: string) => {
    if (isChecked) {
      const field = flattenAttributes.find((f) => f.name === fieldName);
      if (field) {
        onUpdateSelectedFields(selectedFields.concat(field));
      }
    } else {
      onUpdateSelectedFields(
        selectedFields.filter((f) => f.name !== fieldName)
      );
    }
  };
  const handleSelectAll = (isChecked: boolean) => {
    if (isChecked) {
      onUpdateSelectedFields(flattenAttributes);
    } else {
      onUpdateSelectedFields([]);
    }
  };

  useEffect(() => {
    setflattenAttributes(
      translatableProductAttributes
        .map((productType) => {
          return productType.attributeDefinitions.results;
        })
        .reduce((a, b) => a.concat(b), [])
    );
  }, [translatableProductAttributes]);
  return (
    <>
      {!!translatableProductAttributes.length && (
        <div>
          <Label isBold={false}>
            {intl.formatMessage(messages.attributes)}
          </Label>
          <div className={Styles.fieldsWrapper}>
            <CheckboxInput
              onChange={(e) => handleSelectAll(e.target.checked)}
              isChecked={selectedFields.length === flattenAttributes.length}
            >
              {intl.formatMessage(messages.selectAll)}
            </CheckboxInput>
            {translatableProductAttributes.map((productType) => {
              return productType.attributeDefinitions.results.map(
                (attribute) => (
                  <CheckboxInput
                    key={attribute.name}
                    onChange={(e) =>
                      handleFieldChange(e.target.checked, attribute.name)
                    }
                    isChecked={
                      !!selectedFields.find(
                        (item) => item.name === attribute.name
                      )
                    }
                  >
                    {attribute.name}
                  </CheckboxInput>
                )
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default AttributeList;
