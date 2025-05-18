import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { type GridState } from '@interfaces/grid-state';

@Injectable({
  providedIn: 'root'
})
export class ShipmentService {
  private readonly shipmentsGridStateSubject$: BehaviorSubject<GridState> ;
  private readonly shipmentsGridState$: Observable<GridState>;

  private readonly gridInitialState: GridState = {
    sortColumn: null,
    filters: null,
    search: '',
    pageSize: 0,
    currentPage: 0,
    totalRows: 0,
    selectedRows: [],
    rowData: []
  };

  constructor() {
    this.shipmentsGridStateSubject$ = new BehaviorSubject<GridState>(this.gridInitialState);
    this.shipmentsGridState$ = this.shipmentsGridStateSubject$.asObservable();
  }

  get currentState(): GridState {
    return this.shipmentsGridStateSubject$.value;
  }

  updateState(partial: Partial<GridState>): void {
    this.shipmentsGridStateSubject$.next({ ...this.currentState, ...partial });
  }

  stateSubscribe(): Observable<GridState> {
    return this.shipmentsGridState$;
  }
}
