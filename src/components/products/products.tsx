import { useIntl } from 'react-intl';
import { useHistory, useRouteMatch } from 'react-router-dom';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import SecondaryButton from '@commercetools-uikit/secondary-button';
import Spacings from '@commercetools-uikit/spacings';
import SelectField from '@commercetools-uikit/select-field';
import messages from './messages';
import { useApplicationContext } from '@commercetools-frontend/application-shell-connectors';
import {
  useDataTableSortingState,
  usePaginationState,
  useRowSelection,
} from '@commercetools-uikit/hooks';
import {
  TFetchProductsQuery,
  useProductsFetcher,
  useTranslateProducts,
} from '../../hooks/use-products-connector';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import DataTable, { TColumn, TRow } from '@commercetools-uikit/data-table';
import { Pagination } from '@commercetools-uikit/pagination';
import { useEffect, useMemo, useState } from 'react';
import { useProductUpdater } from '../../hooks/use-products-connector/use-products-connector';
import { ContentNotification } from '@commercetools-uikit/notifications';
import {
  InfoDetailPage,
  PageContentWide,
} from '@commercetools-frontend/application-components';

type TProductsProps = {
  linkToWelcome: string;
};

const Products = (props: TProductsProps) => {
  const intl = useIntl();
  const { push } = useHistory();
  const match = useRouteMatch();
  const { translateProductsActions } = useTranslateProducts();

  const { page, perPage } = usePaginationState({ perPage: 50 });
  const tableSorting = useDataTableSortingState({ key: 'id', order: 'asc' });

  const [sourceLang, setSourceLang] = useState<string>();
  const [destLang, setDestLang] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isTranslated, setIsTranslated] = useState(false);
  const { projectLanguages } = useApplicationContext((context) => ({
    dataLocale: context.dataLocale,
    projectLanguages: context.project?.languages,
  }));

  const { productsPaginatedResult, loading } = useProductsFetcher({
    page,
    perPage,
    tableSorting,
    srcLocale: sourceLang,
    dstLocale: destLang,
  });

  const productUpdater = useProductUpdater();

  const {
    rows: rowsWithSelection,
    toggleRow,
    selectAllRows,
    deselectAllRows,
    getIsRowSelected,
    getNumberOfSelectedRows,
  } = useRowSelection('checkbox', productsPaginatedResult?.results || []);
  const countSelectedRows = getNumberOfSelectedRows();
  const isSelectColumnHeaderIndeterminate =
    countSelectedRows > 0 && countSelectedRows < rowsWithSelection.length;
  const handleSelectColumnHeaderChange =
    countSelectedRows === 0 ? selectAllRows : deselectAllRows;
  const columns: Array<TColumn> = [
    {
      key: 'checkbox',
      label: (
        <CheckboxInput
          isIndeterminate={isSelectColumnHeaderIndeterminate}
          isChecked={countSelectedRows !== 0}
          onChange={handleSelectColumnHeaderChange}
        />
      ),
      align: 'center',
      renderItem: (row: TRow) => (
        <CheckboxInput
          isChecked={getIsRowSelected(row.id)}
          onChange={() => toggleRow(row.id)}
        />
      ),
      disableResizing: true,
    },
    { key: 'name', label: 'Product name - source' },
    { key: 'nameDestination', label: 'Product name - destination' },
    { key: 'id', label: 'ID' },
  ];

  const languageOptions = useMemo(
    () => projectLanguages?.map((l) => ({ label: l, value: l })),
    [projectLanguages]
  );

  const onTranslateProducts = async (rows: Array<TRow>) => {
    setIsLoading(true);
    const translatedProductsActions = await translateProductsActions(
      rows,
      destLang!,
      sourceLang!
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
    <>
      <InfoDetailPage
        title={intl.formatMessage(messages.title)}
        onPreviousPathClick={() => push(props.linkToWelcome)}
        previousPathLabel={intl.formatMessage(messages.backToWelcome)}
      >
        <PageContentWide columns="1/1" gapSize={'10'}>
          <SelectField
            title={intl.formatMessage(messages.sourceLang)}
            options={languageOptions}
            onChange={(e) => setSourceLang(e.target.value as string)}
            value={sourceLang}
          />
          <SelectField
            title={intl.formatMessage(messages.destLang)}
            options={languageOptions}
            onChange={(e) => setDestLang(e.target.value as string)}
            value={destLang}
          />
        </PageContentWide>
      </InfoDetailPage>
      <Spacings.Stack scale="s" alignItems={'stretch'}>
        {loading && <LoadingSpinner scale={'s'} />}

        {productsPaginatedResult ? (
          <Spacings.Stack scale="s" alignItems="center">
            <DataTable<
              NonNullable<
                TFetchProductsQuery['productProjectionSearch']['results']
              >[0]
            >
              isCondensed
              columns={columns}
              rows={rowsWithSelection}
              itemRenderer={(item, column) => {
                switch (column.key) {
                  case 'selected':
                    return <CheckboxInput onChange={(e) => console.log(e)} />;
                  case 'id':
                    return item.id;
                  case 'name':
                    return item.name;
                  case 'nameDestination':
                    return item.dstName;
                  default:
                    return null;
                }
              }}
              sortedBy={tableSorting.value.key}
              sortDirection={tableSorting.value.order}
              onSortChange={tableSorting.onChange}
              onRowClick={(row) => push(`${match.url}/${row.id}`)}
              footer={
                <>
                  {!isTranslated && (
                    <SecondaryButton
                      label="translate"
                      iconLeft={
                        isLoading ? <LoadingSpinner scale={'s'} /> : undefined
                      }
                      onClick={() => onTranslateProducts(rowsWithSelection)}
                    />
                  )}
                  {isTranslated && (
                    <ContentNotification type="success">
                      {intl.formatMessage(messages.translated)}
                    </ContentNotification>
                  )}
                </>
              }
            />
            <Pagination
              page={page.value}
              onPageChange={page.onChange}
              perPage={perPage.value}
              onPerPageChange={perPage.onChange}
              totalItems={productsPaginatedResult.total}
              perPageRange={'s'}
            />
          </Spacings.Stack>
        ) : null}
      </Spacings.Stack>
    </>
  );
};
Products.displayName = 'Products';

export default Products;
