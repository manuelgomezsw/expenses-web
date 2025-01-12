import {Component, OnInit} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {Title} from '@angular/platform-browser';

import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatTableModule} from '@angular/material/table';
import {MatIconButton} from "@angular/material/button";
import {MatFormField, MatSuffix} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {NgIf} from "@angular/common";

import {Pocket} from "../../domain/pocket";
import {environment} from "../../../environments/environment";
import {StatusPipe} from '../../pipes/status.pipe';
import {MatOption, MatSelect} from "@angular/material/select";
import {Status} from "../../domain/status";

@Component({
    selector: 'app-list',
    imports: [
        MatToolbarModule,
        MatIconModule,
        FormsModule,
        MatTableModule,
        MatIconButton,
        MatSuffix,
        MatFormField,
        MatInput,
        NgIf,
        StatusPipe,
        MatSelect,
        MatOption,
    ],
    templateUrl: './list.component.html',
    styleUrl: './list.component.css'
})
export class ListPocketsComponent implements OnInit {
    pockets: Pocket[] = [
        {pocket_id: 1, name: 'Hogar', status: true, is_editing: false},
        {pocket_id: 2, name: 'Yaque', status: false, is_editing: false},
        {pocket_id: 3, name: 'Emma', status: true, is_editing: false},
    ];
    displayedColumns: string[] = ['name', 'status', 'actions'];
    status: Status[] = [
        {value: true, name: 'Activo'},
        {value: false, name: 'Inactivo'},
    ];
    selectedStatus: boolean = false;

    constructor(
        private titleService: Title,
    ) {
    }

    ngOnInit() {
        this.titleService.setTitle(environment.titleWebSite + ' - Bolsillos');
    }

    onEdit(pocket: any) {
        this.pockets.forEach(element => {
            element.is_editing = false;
        });
        this.selectedStatus = pocket.status;
        pocket.is_editing = true;
    }

    onSave(pocket: any) {
        pocket.is_editing = false;
    }

    onCancel(pocket: any) {
        pocket.is_editing = false;
    }
}
