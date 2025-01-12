import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule, RouterOutlet} from '@angular/router';
import {Title} from '@angular/platform-browser';

import {MatMenuModule} from '@angular/material/menu';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';

import {environment} from '../environments/environment';

@Component({
    selector: 'app-root',
    imports: [
        CommonModule,
        RouterModule,
        RouterOutlet,
        MatMenuModule,
        MatToolbarModule,
        MatButtonModule
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
