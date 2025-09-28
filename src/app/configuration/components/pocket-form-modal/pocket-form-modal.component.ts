import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { Pocket } from '../../../domain/pocket';

export interface PocketFormData {
  pocket?: Pocket;
  isEditing: boolean;
}

export interface PocketFormResult {
  name: string;
  description?: string;
}

@Component({
  selector: 'app-pocket-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './pocket-form-modal.component.html',
  styleUrl: './pocket-form-modal.component.css'
})
export class PocketFormModalComponent implements OnInit {

  formData: PocketFormResult = {
    name: '',
    description: ''
  };

  constructor(
    public dialogRef: MatDialogRef<PocketFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: PocketFormData
  ) {}

  ngOnInit(): void {
    if (this.data.isEditing && this.data.pocket) {
      this.formData = {
        name: this.data.pocket.name,
        description: this.data.pocket.description || ''
      };
    }
  }

  onSave(): void {
    if (this.isFormValid()) {
      this.dialogRef.close(this.formData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  isFormValid(): boolean {
    return !!(this.formData.name && this.formData.name.trim());
  }

  getTitle(): string {
    return this.data.isEditing ? 'Editar Bolsillo' : 'Crear Nuevo Bolsillo';
  }

  getSaveButtonText(): string {
    return this.data.isEditing ? 'Guardar Cambios' : 'Crear Bolsillo';
  }

  getSaveButtonIcon(): string {
    return this.data.isEditing ? 'save' : 'add';
  }
}