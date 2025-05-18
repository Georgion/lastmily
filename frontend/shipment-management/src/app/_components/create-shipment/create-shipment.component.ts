import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgForOf } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS, MAT_NATIVE_DATE_FORMATS } from '@angular/material/core';
import { MatDatepicker, MatDatepickerInput, MatDatepickerModule, MatDatepickerToggle } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

import { CustomDateAdapter } from '@utilities/date-adapter';
import type { SelectTag } from '@interfaces/select-tag';

@Component({
  selector: 'app-create-shipment',
  imports: [MatDatepickerToggle, MatDatepicker, MatDatepickerInput, MatDialogModule, MatIconModule, MatInputModule, MatSelectModule, NgForOf, ReactiveFormsModule ],
  templateUrl: './create-shipment.component.html',
  styleUrl: './create-shipment.component.css',
  providers: [MatDatepickerModule, { provide: DateAdapter, useClass: CustomDateAdapter }, { provide: MAT_DATE_FORMATS, useValue: MAT_NATIVE_DATE_FORMATS }],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateShipmentComponent {
  minDate: Date = new Date();
  createShipmentForm: FormGroup;
  selectStatusOptions: SelectTag[];

  private readonly dialogRef = inject(MatDialogRef<CreateShipmentComponent>);
  private readonly formBuilder: FormBuilder = new FormBuilder();
  private readonly formControlsConfig = {
    name: [null, Validators.required.bind(Validators)],
    status: [null, Validators.required.bind(Validators)],
    creationDate: [Date.UTC(this.minDate.getUTCFullYear(), this.minDate.getUTCMonth(), this.minDate.getUTCDate())],
    desiredDeliveryDate: [null, Validators.required.bind(Validators)]
  };

  // convenience getter for easy access to form fields
  get form(): { [p: string]: AbstractControl } {
    return this.createShipmentForm.controls;
  }

  constructor() {
    this.minDate = new Date();
    this.selectStatusOptions = [
      { text: 'Pending', value: 'Pending' },
      { text: 'Shipped', value: 'Shipped' },
      { text: 'Delivered', value: 'Delivered' }
    ];
    this.createShipmentForm = this.formBuilder.group(this.formControlsConfig);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    this.dialogRef.close(this.createShipmentForm.value);
  }
}
