import { Component } from '@angular/core';
import { Router } from "@angular/router";

@Component({
  selector: 'app-error-not-found',
  imports: [],
  templateUrl: './error-not-found.component.html',
  styleUrl: './error-not-found.component.css'
})
export class ErrorNotFoundComponent {
  pageUrl: string;

  constructor(private readonly router: Router) {
    this.pageUrl = this.router.url;
  }
}
