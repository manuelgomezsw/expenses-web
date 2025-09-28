import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

import { FixedExpense } from '../../../domain/fixed-expense';
import { Pocket } from '../../../domain/pocket';

export interface ExpenseFormData {
  expense?: FixedExpense;
  availablePockets: Pocket[];
  isEditing: boolean;
}

export interface ExpenseFormResult {
  pocket_name: string;
  concept_name: string;
  amount: number;
  payment_day: number;
}

@Component({
  selector: 'app-expense-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './expense-form-modal.component.html',
  styleUrl: './expense-form-modal.component.css'
})
export class ExpenseFormModalComponent implements OnInit {

  formData: ExpenseFormResult = {
    pocket_name: '',
    concept_name: '',
    amount: 0,
    payment_day: 1
  };

  constructor(
    public dialogRef: MatDialogRef<ExpenseFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExpenseFormData
  ) {}

  ngOnInit(): void {
    if (this.data.isEditing && this.data.expense) {
      this.formData = {
        pocket_name: this.data.expense.pocket_name,
        concept_name: this.data.expense.concept_name,
        amount: this.data.expense.amount,
        payment_day: this.data.expense.payment_day
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
    return !!(
      this.formData.pocket_name &&
      this.formData.concept_name.trim() &&
      this.formData.amount > 0 &&
      this.formData.payment_day >= 1 &&
      this.formData.payment_day <= 31
    );
  }

  getTitle(): string {
    return this.data.isEditing ? 'Editar Gasto Fijo' : 'Agregar Nuevo Gasto Fijo';
  }

  getSaveButtonText(): string {
    return this.data.isEditing ? 'Guardar Cambios' : 'Agregar Gasto';
  }

  getSaveButtonIcon(): string {
    return this.data.isEditing ? 'save' : 'add';
  }
}