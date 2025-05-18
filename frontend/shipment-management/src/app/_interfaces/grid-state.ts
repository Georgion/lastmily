import { type Shipment } from '@interfaces/shipment';

interface FilterDefinition {
  filterType: string;
  type: string;
  filter: string | number | boolean | null;
}

export interface GridState {
  sortColumn: { columnId: string; sort:  "asc" | "desc" } | null;
  filters: Record<string, FilterDefinition> | null;
  search: string;
  pageSize: number;
  currentPage: number;
  totalRows: number;
  selectedRows: Shipment[];
  rowData: string[];
}
