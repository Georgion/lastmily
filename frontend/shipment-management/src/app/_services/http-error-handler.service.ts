import { inject, Injectable } from '@angular/core';
import { HttpErrorResponse } from "@angular/common/http";
import { MatDialog } from '@angular/material/dialog';
import { Observable, of } from "rxjs";

import { AlertDialogComponent } from '@components/alert-dialog/alert-dialog.component';

export type HandleError = <T>(operation?: string, result?: T) => (error: HttpErrorResponse) => Observable<T>;

@Injectable({
  providedIn: "root"
})
export class HttpErrorHandler {
  private readonly dialog: MatDialog = inject(MatDialog);

  createHandleError = (serviceName = "") => {
    return <T>(operation = "operation", result: unknown = "error"): ((error: HttpErrorResponse) => Observable<T>) =>
      this.handleError(serviceName, operation, result);
  };

  /**
   * Returns a function that handles Http operation failures.
   * This error handler lets the app continue to run as if no error occurred.
   *
   * @param serviceName = name of the data service that attempted the operation
   * @param operation - optional name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  handleError<T>(serviceName = "", operation = "operation", result: unknown = "error") {
    return (response: HttpErrorResponse): Observable<T> => {
      console.error(response);

      let message: string;
      if (HttpErrorHandler.isError(response) && typeof response.error === "string" && !response.error.startsWith("<!DOCTYPE html>")) {
        message = response.error;
        this.dialog.open(AlertDialogComponent, {
          disableClose: true,
          data: {
            title: 'Error',
            message: `${serviceName} - ${operation} failed: ${message}`,
            type: 'error'
          }
        });
      } else {
        this.dialog.open(AlertDialogComponent, {
          disableClose: true,
          data: {
            title: 'Error',
            message: `${serviceName} - ${operation} failed: Server returned code ${response.status} with message "${response.message}"`,
            type: 'error'
          }
        });
      }

      // Let the app keep running by returning a safe result.
      return of(result as T);
    };
  }

  private static isError(obj: unknown): obj is HttpErrorResponse {
    return (obj as HttpErrorResponse).error !== undefined;
  }
}
