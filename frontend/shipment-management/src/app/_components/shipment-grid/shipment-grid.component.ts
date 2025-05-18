import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import { formatDate } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { BehaviorSubject, debounceTime, distinctUntilChanged, filter, Observable, Subject, takeUntil } from 'rxjs';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColumnState, FilterModel, GetRowIdParams, GridReadyEvent, ICellRendererParams } from 'ag-grid-community';
import { AllCommunityModule, ClientSideRowModelModule, themeMaterial } from 'ag-grid-community';

import { DATE_FORMAT, DATE_LOCALE } from '@environments/constants';
import { DatasourceService } from '@services/datasource.service';
import { ShipmentService } from '@services/shipment.service';
import type { GridConfig } from '@interfaces/grid-config';
import type { GridState } from '@interfaces/grid-state';
import { CreateShipmentComponent } from '@components/create-shipment/create-shipment.component';
import { StateManagementComponent } from '@components/state-management/state-management.component';

@Component({
  selector: 'app-shipment-grid',
  imports: [AgGridAngular, MatIcon, StateManagementComponent],
  templateUrl: './shipment-grid.component.html',
  styleUrl: './shipment-grid.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShipmentGridComponent implements OnDestroy {
  gridConfig: GridConfig = {
    gridModules: [AllCommunityModule, ClientSideRowModelModule],
    gridOptions: {
      getRowId: (rowIdParams: GetRowIdParams) => String(rowIdParams.data.id),
      theme: themeMaterial.withParams({
        accentColor: '#565e71',
        foregroundColor: '#005cbb',
        cellTextColor: '#333333'
      }),
      columnDefs: [
        {
          field: 'id'
        },
        {
          field: 'name',
          headerName: 'Customer Name',
          filter: true,
          suppressHeaderFilterButton: true
        },
        {
          field: 'status',
          filter: true,
          suppressHeaderFilterButton: true,
          editable: true,
          cellEditor: 'agSelectCellEditor',
          cellEditorParams: {
            values: ['Pending', 'Shipped', 'Delivered']
          },
          valueSetter: (setterParams): true => {
            this.datasourceService.patchShipment(setterParams.data.id, { status: setterParams.newValue });
            return true;
          }
        },
        {
          field: 'creationDate',
          valueFormatter: (formatterParams): string => {
            return typeof formatterParams.value === 'number' ? formatDate(formatterParams.value, this.dateFormat, this.dateLocale) : '';
          },
          sort: 'desc'
        },
        {
          field: 'desiredDeliveryDate',
          valueFormatter: (formatterParams): string => {
            return typeof formatterParams.value === 'number' ? formatDate(formatterParams.value, this.dateFormat, this.dateLocale) : '';
          }
        }
      ],
      defaultColDef: {
        flex: 1,
        enableCellChangeFlash: true,
        cellRenderer: (rendererParams: ICellRendererParams): string | null | undefined => {
          if (rendererParams.value === undefined) {
            return '<div class="skeleton-box"></div>';
          } else {
            return rendererParams?.valueFormatted ?? rendererParams.value;
          }
        }
      },
      rowSelection: {
        mode: 'multiRow',
        enableClickSelection: false,
        headerCheckbox: false
      },
      rowModelType: 'infinite',
      pagination: true,
      paginationPageSize: 10,
      paginationPageSizeSelector: [10, 20, 50, 100],
      cacheBlockSize: 20,
      maxBlocksInCache: 5
    }
  };

  gridState$: Observable<GridState> = new Observable<GridState>(); // State Management Demo
  private readonly ngUnsubscribe$: Subject<void> = new Subject<void>();
  private readonly searchByName$: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly datasourceService: DatasourceService = inject(DatasourceService);
  private readonly shipmentService: ShipmentService = inject(ShipmentService);
  private readonly dateLocale: string = DATE_LOCALE;
  private readonly dateFormat: string = DATE_FORMAT;
  private enableSearch: boolean = false;

  constructor() {
    this.gridState$ = this.shipmentService.stateSubscribe();
  }

  onGridReady(event: GridReadyEvent): void {
    this.datasourceService.setGridApi(event.api);
    this.datasourceService.setGridOptions(this.gridConfig);

    const searchDebounceTime = 500;
    this.searchByName$
      .pipe(
        debounceTime(searchDebounceTime),
        distinctUntilChanged((prev, curr) => prev.trim() === curr.trim()),
        filter((name: string): boolean => name.length === 0 || name.length >= 3),
        takeUntil(this.ngUnsubscribe$)
      )
      .subscribe((name: string) => {
        if (this.enableSearch) {
          this.datasourceService.setGridColumnFilter('name', 'contains', name);
        }
      });
  }

  // <editor-fold desc="State Management Demo">
  onSortChanged(): void {
    const getColumnState: ColumnState[] = this.datasourceService.getGridApi()?.getColumnState();
    let sortModel!: { columnId: string; sort: 'asc' | 'desc' };
    for (const columnState of getColumnState) {
      if (columnState.sort) {
        sortModel = { columnId: columnState.colId, sort: columnState.sort };
      }
    }
    this.shipmentService.updateState({ sortColumn: sortModel });
  }

  onFilterChanged(): void {
    const filterModel: FilterModel = this.datasourceService.getGridApi()?.getFilterModel();
    const search = filterModel['name'] ? filterModel['name'].filter : '';
    this.shipmentService.updateState({ filters: filterModel, search });
  }

  onPaginationChanged(): void {
    const pageSize: number = this.datasourceService.getGridApi()?.paginationGetPageSize();
    const currentPage: number = this.datasourceService.getGridApi()?.paginationGetCurrentPage() + 1; // zero indexed
    this.shipmentService.updateState({
      pageSize,
      currentPage,
      totalRows: this.datasourceService.getGridApi()?.paginationGetRowCount(),
      rowData: this.datasourceService.getGridApi()?.getDataAsCsv({ suppressQuotes: true })?.split('\r\n') ?? []
    });
  }

  onSelectionChanged(): void {
    const selectedRows = this.datasourceService.getGridApi()?.getSelectedRows();
    this.shipmentService.updateState({ selectedRows });
  }
  // </editor-fold>

  addShipment(): void {
    this.openCreateShipmentDialog();
  }

  applyStatusFilter(event: Event): void {
    const selected = event.target as HTMLSelectElement;
    this.datasourceService.setGridColumnFilter('status', 'equals', selected.value === '' ? '' : selected.value);
  }

  search(event: Event) {
    this.enableSearch = true;
    const inputValue = (event.target as HTMLInputElement).value;
    this.searchByName$.next(inputValue);
  }

  deleteSelectedShipments(): void {
    this.datasourceService.deleteShipments();
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe$.next();
  }

  private openCreateShipmentDialog(): void {
    const dialogRef = this.dialog.open(CreateShipmentComponent, {
      disableClose: true
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result !== undefined) {
        this.datasourceService.postShipment(result);
      }
    });
  }
}
