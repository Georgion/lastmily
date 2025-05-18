import { HttpContext, HttpHeaders, HttpParams } from "@angular/common/http";

export interface HttpOptions {
  headers?: HttpHeaders | Record<string, string | string[]>;
  context?: HttpContext;
  observe?: "body" | "events" | "response";
  params?: HttpParams | Record<string, string | string[]>;
  responseType?: "arraybuffer" | "blob" | "json" | "text";
  reportProgress?: boolean;
  withCredentials?: boolean;
}
