import { Injectable } from '@angular/core';
import { HttpClient, HttpContext, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { delay, Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { HttpOptions } from '@interfaces/http-options';
import { HttpErrorHandler, HandleError } from './http-error-handler.service';

const defaultHttpOptions = {
  headers: new HttpHeaders({
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }),
  context: new HttpContext(),
  observe: "response" as const,
  params: new HttpParams(),
  responseType: 'json' as const,
  reportProgress: true,
  withCredentials: false
};

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly handleError: HandleError;
  private readonly delay = 1000;

  constructor(
    httpErrorHandler: HttpErrorHandler,
    private readonly http: HttpClient
  ) {
    this.handleError = httpErrorHandler.createHandleError('ApiService');
  }

  get(apiURL: string, operation = 'GET Method', getHttpOptions: HttpOptions = {}, errorResult?: HttpResponse<unknown>): Observable<HttpResponse<unknown> | ArrayBuffer> {
    const options = Object.assign({}, defaultHttpOptions, getHttpOptions);
    return this.http.get(`${apiURL}`, options).pipe(delay(this.delay), catchError(this.handleError(operation, errorResult)));
  }

  post(apiURL: string, data: unknown, operation = 'POST Method', postHttpOptions: HttpOptions = {}, errorResult?: HttpResponse<unknown>): Observable<HttpResponse<unknown> | ArrayBuffer> {
    const options = Object.assign({}, defaultHttpOptions, postHttpOptions);
    return this.http.post(`${apiURL}`, data, options).pipe(delay(this.delay), catchError(this.handleError(operation, errorResult)));
  }

  patch(apiURL: string, data: unknown, operation = 'PATCH Method', patchHttpOptions: HttpOptions = {}, errorResult: unknown = null): Observable<unknown> {
    const options = Object.assign({}, defaultHttpOptions, patchHttpOptions);
    return this.http.patch(`${apiURL}`, data, options).pipe(delay(this.delay), catchError(this.handleError(operation, errorResult)));
  }

  delete(apiURL: string, operation = 'DELETE Method', patchHttpOptions: HttpOptions = {}, errorResult: unknown = null): Observable<unknown> {
    const options = Object.assign({}, defaultHttpOptions, patchHttpOptions);
    return this.http.delete(`${apiURL}`, options).pipe(delay(this.delay), catchError(this.handleError(operation, errorResult)));
  }
}
