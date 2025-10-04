import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { DailyExpense } from '../../../domain/daily-expense';

export interface DailyExpenseFormData {
  expense?: DailyExpense;
  isEditing: boolean;
}

export interface DailyExpenseFormResult {
  description: string;
  amount: number;
  date: string;
}

@Component({
  selector: 'app-daily-expense-form-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './daily-expense-form-modal.component.html',
  styleUrl: './daily-expense-form-modal.component.css'
})
export class DailyExpenseFormModalComponent implements OnInit {
  
  formData: DailyExpenseFormResult = {
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  };

  constructor(
    public dialogRef: MatDialogRef<DailyExpenseFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DailyExpenseFormData
  ) {}

  ngOnInit(): void {
    if (this.data.isEditing && this.data.expense) {
      this.formData = {
        description: this.data.expense.description,
        amount: this.data.expense.amount,
        date: this.data.expense.date
      };
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.isFormValid()) {
      this.dialogRef.close(this.formData);
    }
  }

  isFormValid(): boolean {
    return !!(
      this.formData.description.trim() &&
      this.formData.amount > 0 &&
      this.formData.date
    );
  }

  getTitle(): string {
    return this.data.isEditing ? 'Editar Gasto Diario' : 'Agregar Gasto Diario';
  }

  getSaveButtonText(): string {
    return this.data.isEditing ? 'Guardar' : 'Agregar';
  }
}
