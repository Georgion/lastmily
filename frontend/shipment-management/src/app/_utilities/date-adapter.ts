import { Injectable } from "@angular/core";
import { NativeDateAdapter } from "@angular/material/core";

@Injectable({
  providedIn: "root"
})
export class CustomDateAdapter extends NativeDateAdapter {

  override format(date: Date, displayFormat: { [p: string]: unknown }): string {
    if (displayFormat["year"] === "numeric" && displayFormat["month"] === "short") {
      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();
      return `${month} ${year}`;
    }
    if (displayFormat["year"] === "numeric" && displayFormat["month"] === "long" && displayFormat["day"] === "numeric") {
      const day = date.getDate().toString().padStart(Number("2"), "0");
      const month = date.toLocaleString("default", { month: "long" });
      const year = date.getFullYear().toString();
      return `${year} ${month} ${day}`;
    }
    if (displayFormat["year"] === "numeric" && displayFormat["month"] === "numeric" && displayFormat["day"] === "numeric") {
      const day = date.getDate().toString().padStart(Number("2"), "0");
      const month = (date.getMonth() + 1).toString().padStart(Number("2"), "0");
      const year = date.getFullYear().toString();
      return `${year}/${month}/${day}`;
    }
    return date.toDateString();
  }

}
