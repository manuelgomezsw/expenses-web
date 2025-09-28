import {Component} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterOutlet} from '@angular/router';
import {Title} from '@angular/platform-browser';

import {NavigationComponent} from './shared/components/navigation/navigation.component';
import {environment} from '../environments/environment';

@Component({
    selector: 'app-root',
    imports: [
        CommonModule,
        RouterOutlet,
        NavigationComponent
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
