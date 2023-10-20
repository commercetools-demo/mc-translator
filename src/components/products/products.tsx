import { useIntl } from 'react-intl';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import DataTable, { TColumn, TRow } from '@commercetools-uikit/data-table';
import { Pagination } from '@commercetools-uikit/pagination';
import { useState } from 'react';
import { InfoDetailPage } from '@commercetools-frontend/application-components';
import Grid from '@commercetools-uikit/grid';
import { ContentNotification } from '@commercetools-uikit/notifications';
import {
  useDataTableSortingState,
  usePaginationState,
  useRowSelection,
} from '@commercetools-uikit/hooks';
import messages from './messages';
import {
  TFetchProductsQuery,
  useProductsFetcher,
} from '../../hooks/use-products-connector';
import ProductConfigurator from './product-configurator';
import Styles from './products.module.css';

type TProductsProps = {
  linkToWelcome: string;
};

const Products = (props: TProductsProps) => {
  const intl = useIntl();
  const { source, dest } = useParams<{
    source: string | undefined;
    dest: string | undefined;
  }>();
  const { push } = useHistory();
  const match = useRouteMatch();

  const { page, perPage } = usePaginationState({ perPage: 50 });
  const tableSorting = useDataTableSortingState({ key: 'id', order: 'asc' });

  const [sourceLang, setSourceLang] = useState(source);
  const [destLang, setDestLang] = useState(dest);

  const { productsPaginatedResult, loading } = useProductsFetcher({
    page,
    perPage,
    tableSorting,
    srcLocale: sourceLang,
    dstLocale: destLang,
  });

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

  return (
    <InfoDetailPage
      title={intl.formatMessage(messages.title)}
      onPreviousPathClick={() => push(props.linkToWelcome)}
      previousPathLabel={intl.formatMessage(messages.backToWelcome)}
    >
      <Grid
        display={'grid'}
        gridGap="16px"
        gridAutoColumns="1fr"
        gridTemplateColumns="repeat(6, 1fr)"
      >
        <Grid.Item gridColumnStart="1" gridColumn="1">
          <div className={Styles.configuratorContainer}>
            <ProductConfigurator
              products={rowsWithSelection}
              sourceLang={sourceLang}
              destLang={destLang}
              onDestLangChange={setDestLang}
              onSourceLangChange={setSourceLang}
            />
          </div>
        </Grid.Item>
        <Grid.Item gridColumnStart="2" gridColumnEnd="7">
          <Spacings.Stack scale="s" alignItems={'stretch'}>
            {loading && <LoadingSpinner scale={'s'} />}

            {productsPaginatedResult ? (
              <Spacings.Stack scale="s" alignItems="stretch">
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
                        return (
                          <CheckboxInput onChange={(e) => console.log(e)} />
                        );
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
                  footer={<></>}
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
            ) : (
              <ContentNotification type="warning">
                {intl.formatMessage(messages.noResults)}
              </ContentNotification>
            )}
          </Spacings.Stack>
        </Grid.Item>
      </Grid>
    </InfoDetailPage>
  );
};
Products.displayName = 'Products';

export default Products;
