import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-alert-dialog',
  imports: [MatDialogModule, MatIcon],
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.css']
})
export class AlertDialogComponent {
  data: Record<string, string> = {};

  private readonly dialogRef: MatDialogRef<AlertDialogComponent> = inject(MatDialogRef<AlertDialogComponent>);
  private readonly dialogData: Record<string, string> = inject<Record<string, string>>(MAT_DIALOG_DATA);

  constructor() {
    this.data = { ...this.data, ...this.dialogData };
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
