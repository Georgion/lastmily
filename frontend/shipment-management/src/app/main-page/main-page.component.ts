import { Component } from '@angular/core';

import { ShipmentGridComponent } from '@components/shipment-grid/shipment-grid.component';

@Component({
  selector: 'app-main-page',
  imports: [ShipmentGridComponent],
  templateUrl: './main-page.component.html',
  styleUrl: './main-page.component.css'
})
export class MainPageComponent {}
