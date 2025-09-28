import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {Title} from '@angular/platform-browser';

import {environment} from '../environments/environment';

@Component({
    selector: 'app-root',
    imports: [
        CommonModule,
        RouterOutlet
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css'
})
export class AppComponent {
    constructor(private titleService: Title) {
    }

    ngOnInit() {
        this.titleService.setTitle(environment.titleWebSite);
    }
}
