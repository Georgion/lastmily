import { Component, inject } from '@angular/core';
import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';
import { Observable } from 'rxjs';

import { ShipmentService } from '@services/shipment.service';
import type { GridState } from '@interfaces/grid-state';

@Component({
  selector: 'app-state-management',
  imports: [AsyncPipe, JsonPipe, NgIf],
  templateUrl: './state-management.component.html',
  styleUrl: './state-management.component.css'
})
export class StateManagementComponent {
  gridState$: Observable<GridState> = new Observable<GridState>();

  private readonly shipmentService: ShipmentService = inject(ShipmentService);

  constructor() {
    this.gridState$ = this.shipmentService.stateSubscribe();
  }
}
