import { inject, Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { isDate } from 'date-fns';
import { IDatasource, IGetRowsParams, SortModelItem } from 'ag-grid-community';
import type { ColumnState, GridApi } from 'ag-grid-community';

import { API_SERVER_URL } from '@environments/constants';
import { type GridConfig } from '@interfaces/grid-config';
import { isShipmentCreatePatchResponse, isShipmentDeleteResponse, isShipmentPaginatedListResponse, type Shipment } from '@interfaces/shipment';
import { ApiService } from '@services/api.service';
import { ShipmentService } from '@services/shipment.service';
import { createUTCTimestamp } from '@utilities/utilities';
import { AlertDialogComponent } from '@components/alert-dialog/alert-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class DatasourceService {
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly apiService: ApiService = inject(ApiService);
  private readonly shipmentService: ShipmentService = inject(ShipmentService);
  private gridApi!: GridApi;
  private createdUpdatedShipment: Shipment | undefined;

  setGridApi(gridApi: GridApi): void {
    this.gridApi = gridApi;
  }

  getGridApi(): GridApi {
    return this.gridApi
  }

  setGridOptions(gridConfig: GridConfig): void {
    this.gridApi.setGridOption('columnDefs', gridConfig.gridOptions.columnDefs);
    this.gridApi.setGridOption('defaultColDef', gridConfig.gridOptions.defaultColDef);
    this.gridApi.setGridOption('rowSelection', gridConfig.gridOptions.rowSelection);
    this.gridApi.setGridOption('pagination', gridConfig.gridOptions.pagination);
    this.gridApi.setGridOption('datasource', this.getDatasource());

    this.setGridInitialState(); // State Management Demo
  }

  getDatasource(): IDatasource {
    return {
      getRows: (rowsParams: IGetRowsParams) => {
        this.gridApi.setGridOption('loading', true);

        const offset: number = rowsParams.startRow;
        const limit: number = rowsParams.endRow - rowsParams.startRow;

        const sortModel: SortModelItem[] = rowsParams.sortModel;
        const filterModel = rowsParams.filterModel;

        let params: HttpParams = new HttpParams();
        params = params.set('offset', offset);
        params = params.set('limit', limit);
        params = params.set('filterModel', JSON.stringify(filterModel));
        for (const row of sortModel) {
          params = params.append('sortModel', row.colId + ',' + row.sort);
        }
        this.apiService
          .get(`${API_SERVER_URL}shipments?${params}`, `Get paginated shipments with filters and sorting`)
          .subscribe({
            next: (response: unknown) => {
              this.gridApi.setGridOption('loading', false);
              if (isShipmentPaginatedListResponse(response)) {
                rowsParams.successCallback(response.body.rows, response.body.total);
                if (this.createdUpdatedShipment) {
                  const rowNode = this.gridApi.getRowNode(this.createdUpdatedShipment.id);
                  if (rowNode) {
                    this.gridApi.flashCells({ rowNodes: [rowNode] });
                  }
                  this.createdUpdatedShipment = undefined;
                }
                if (response.body.total === 0) {
                  this.gridApi.showNoRowsOverlay();
                }
              }
              if (response === 'error') {
                rowsParams.successCallback([], 0);
                this.gridApi.setGridOption('loading', false);
                this.gridApi.showNoRowsOverlay();
              }
            }
          });
      }
    };
  }

  setGridColumnFilter(columnId: string, columnFilterType: string, columnFilterValue: string) {
    this.gridApi.setColumnFilterModel(columnId, { type: columnFilterType, filter: columnFilterValue }).then((): void => {
      this.gridApi.onFilterChanged();
    });
  }

  patchShipment(id: string, updates: Record<string, string>): void {
    this.apiService.patch(`${API_SERVER_URL}shipments/patch/${id}`, updates, `Update a shipment property`).subscribe({
      next: (response: unknown) => {
        if (isShipmentCreatePatchResponse(response)) {
          this.dialog.open(AlertDialogComponent, {
            disableClose: true,
            data: {
              title: 'Update Shipment',
              message: response.body.message,
              type: 'success'
            }
          });
          this.updateGrid(response.body.shipment);
        }
      }
    });
  }

  postShipment(shipment: Shipment): void {
    if (isDate(shipment.desiredDeliveryDate)) {
      shipment.desiredDeliveryDate = createUTCTimestamp(shipment.desiredDeliveryDate);
    }

    this.apiService.post(`${API_SERVER_URL}shipments/create`, shipment, `Post a new shipment`).subscribe({
      next: (response: unknown) => {
        if (isShipmentCreatePatchResponse(response)) {
          this.dialog.open(AlertDialogComponent, {
            disableClose: true,
            data: {
              title: 'Add Shipment',
              message: response.body.message,
              type: 'success'
            }
          });
          this.updateGrid(response.body.shipment);
        }
      }
    });
  }

  deleteShipments(): void {
    const selectedRowData = this.gridApi.getSelectedRows();
    if (selectedRowData.length === 0) {
      this.dialog.open(AlertDialogComponent, {
        disableClose: true,
        data: {
          title: 'Delete Shipment(s)',
          message: 'Please select at least one shipment to delete.',
          type: 'warning'
        }
      });
      return;
    }

    let params = new HttpParams();
    for (const row of selectedRowData) {
      params = params.append('ids', row['id']);
    }
    this.apiService
      .delete(`${API_SERVER_URL}shipments/delete`, `Delete selected shipments`, { params })
      .subscribe({
        next: (response: unknown) => {
          if (isShipmentDeleteResponse(response)) {
            this.dialog.open(AlertDialogComponent, {
              disableClose: true,
              data: {
                title: 'Delete Shipment(s)',
                message: response.body.message,
                type: 'success'
              }
            });
            this.gridApi.deselectAll();
            this.updateGrid();
          }
        }
      });
  }

  private updateGrid(shipment?: Shipment): void {
    this.gridApi.refreshInfiniteCache();

    if (shipment) {
      this.createdUpdatedShipment = shipment;
    }
  }

  // State Management Demo
  private setGridInitialState(): void {
    const getColumnState: ColumnState[] = this.gridApi.getColumnState();
    let sortModel: {columnId: string, sort: 'asc' | 'desc'} | null = null;
    for (const columnState of getColumnState) {
      if (columnState.sort) {
        sortModel = { columnId: columnState.colId, sort: columnState.sort };
      }
    }
    this.shipmentService.updateState({
      sortColumn: sortModel || null,
      selectedRows: this.gridApi.getSelectedRows()
    });
  }
}
