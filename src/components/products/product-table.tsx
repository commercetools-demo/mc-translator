import DataTableManager, {
  UPDATE_ACTIONS,
} from '@commercetools-uikit/data-table-manager';
import DataTable, { TColumn } from '@commercetools-uikit/data-table';
import { FC, useState } from 'react';
import CheckboxInput from '@commercetools-uikit/checkbox-input';
import { TRowItem, useRowSelection } from '@commercetools-uikit/hooks';
import { FormattedMessage } from 'react-intl';
import messages from './messages';
import { useHistory, useRouteMatch } from 'react-router-dom';
import { TDataTableSortingState } from '@commercetools-uikit/hooks/dist/declarations/src/use-data-table-sorting-state/use-data-table-sorting-state';

const initialVisibleColumns: Array<TColumn> = [
  { key: 'name', label: 'Product name - source' },
  { key: 'nameDestination', label: 'Product name - destination' },
  { key: 'id', label: 'ID', isSortable: true },
];

const initialHiddenColumns: Array<TColumn> = [
  {
    key: 'Translation Status',
    label: <FormattedMessage {...messages.title} />,
    isSortable: true,
  },
];

const initialColumnsState = [...initialVisibleColumns, ...initialHiddenColumns];

type ProductTableProps = {
  items: Array<TRowItem>;
  tableSorting: TDataTableSortingState;
};
const ProductTable: FC<ProductTableProps> = ({ items, tableSorting }) => {
  const { push } = useHistory();
  const match = useRouteMatch();
  const [tableData, setTableData] = useState({
    columns: initialColumnsState,
    visibleColumnKeys: initialVisibleColumns.map(({ key }) => key),
  });

  const [isCondensed, setIsCondensed] = useState(true);
  const [isWrappingText, setIsWrappingText] = useState(false);
  const {
    rows: rowsWithSelection,
    toggleRow,
    selectAllRows,
    deselectAllRows,
    getIsRowSelected,
    getNumberOfSelectedRows,
  } = useRowSelection('checkbox', items);

  const countSelectedRows = getNumberOfSelectedRows();
  const isSelectColumnHeaderIndeterminate =
    countSelectedRows > 0 && countSelectedRows < rowsWithSelection.length;
  const handleSelectColumnHeaderChange =
    countSelectedRows === 0 ? selectAllRows : deselectAllRows;

  const mappedColumns: {
    [key: string]: TColumn;
  } = tableData.columns.reduce(
    (columns, column) => ({
      ...columns,
      [column.key]: column,
    }),
    {}
  );
  const visibleColumns = tableData.visibleColumnKeys.map(
    (columnKey) => mappedColumns[columnKey]
  );

  const columnsWithSelect: Array<TColumn> = [
    {
      key: 'checkbox',
      label: (
        <CheckboxInput
          isIndeterminate={isSelectColumnHeaderIndeterminate}
          isChecked={countSelectedRows !== 0}
          onChange={handleSelectColumnHeaderChange}
        />
      ),
      shouldIgnoreRowClick: true,
      align: 'center',
      renderItem: (row) => (
        <CheckboxInput
          isChecked={getIsRowSelected(row.id)}
          onChange={() => toggleRow(row.id)}
        />
      ),
      disableResizing: true,
    },
    ...visibleColumns,
  ];
  const onSettingChange = (action: string, nextValue: boolean | string[]) => {
    const {
      COLUMNS_UPDATE,
      IS_TABLE_CONDENSED_UPDATE,
      IS_TABLE_WRAPPING_TEXT_UPDATE,
    } = UPDATE_ACTIONS;

    switch (action) {
      case IS_TABLE_CONDENSED_UPDATE: {
        setIsCondensed(nextValue as boolean);
        break;
      }
      case IS_TABLE_WRAPPING_TEXT_UPDATE: {
        setIsWrappingText(nextValue as boolean);
        break;
      }
      case COLUMNS_UPDATE: {
        if (Array.isArray(nextValue)) {
          Array.isArray(nextValue) &&
            setTableData({
              ...tableData,
              columns: tableData.columns.filter((column) =>
                nextValue.includes(column.key)
              ),
              visibleColumnKeys: nextValue,
            });
        }
        break;
      }
    }
  };

  const displaySettings = {
    disableDisplaySettings: false,
    isCondensed,
    isWrappingText,
  };

  const columnManager = {
    areHiddenColumnsSearchable: true,
    disableColumnManager: false,
    visibleColumnKeys: tableData.visibleColumnKeys,
    hideableColumns: tableData.columns,
  };
  return (
    <DataTableManager
      columns={columnsWithSelect}
      onSettingsChange={onSettingChange}
      columnManager={columnManager}
      displaySettings={displaySettings}
    >
      <DataTable
        isCondensed
        rows={rowsWithSelection}
        columns={columnsWithSelect}
        itemRenderer={(item, column) => {
          switch (column.key) {
            case 'id':
              return item.id;
            case 'name':
              return item.name;
            case 'nameDestination':
              return item.dstName;
            default:
              console.log(column.key);
              return null;
          }
        }}
        sortedBy={tableSorting.value.key}
        sortDirection={tableSorting.value.order}
        onSortChange={tableSorting.onChange}
        onRowClick={(row) => push(`${match.url}/${row.id}`)}
      />
    </DataTableManager>
  );
};

export default ProductTable;
