import {Component} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';
import {Router} from '@angular/router';
import {Title} from '@angular/platform-browser';

import {MatToolbarModule} from '@angular/material/toolbar';

import {environment} from '../../../environments/environment';

@Component({
    selector: 'app-new',
    imports: [
        FormsModule,
        CommonModule,
        MatToolbarModule
    ],
    templateUrl: './new.component.html',
    styleUrl: './new.component.css'
})
export class NewPocketComponent {
    constructor(
        private router: Router,
        private titleService: Title,
    ) {
    }

    ngOnInit() {
        this.titleService.setTitle(environment.titleWebSite + ' - Nuevo bolsillo');
    }
}
