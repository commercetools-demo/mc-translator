/* eslint-disable @typescript-eslint/no-explicit-any */
import { useIntl } from 'react-intl';
import { useHistory, useParams } from 'react-router-dom';
import Spacings from '@commercetools-uikit/spacings';
import LoadingSpinner from '@commercetools-uikit/loading-spinner';
import { Pagination } from '@commercetools-uikit/pagination';
import { useState } from 'react';
import { InfoDetailPage } from '@commercetools-frontend/application-components';
import Grid from '@commercetools-uikit/grid';
import { ContentNotification } from '@commercetools-uikit/notifications';
import {
  useDataTableSortingState,
  usePaginationState,
} from '@commercetools-uikit/hooks';
import messages from './messages';
import { useProductsFetcher } from '../../hooks/use-products-connector';
import ProductConfigurator from './product-configurator';
import Styles from './products.module.css';
import ProductTable from './product-table';

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

  const { page, perPage } = usePaginationState({ perPage: 50 });
  const tableSorting = useDataTableSortingState({ key: 'id', order: 'asc' });

  const [sourceLang, setSourceLang] = useState(source);
  const [destLang, setDestLang] = useState(dest);
  const [selectedProducts, setSelectedProducts] = useState<any[]>([]);

  const { productsPaginatedResult, loading } = useProductsFetcher({
    page,
    perPage,
    tableSorting,
    srcLocale: sourceLang,
    dstLocale: destLang,
  });

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
              products={selectedProducts}
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
                <ProductTable
                  items={productsPaginatedResult.results}
                  tableSorting={tableSorting}
                  onSelectedRowsChange={setSelectedProducts}
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
