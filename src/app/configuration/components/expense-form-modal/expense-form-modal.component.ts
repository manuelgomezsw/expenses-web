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
  pocket_id: number;
  concept_name: string;
  amount: number;
  payment_day: number;
  expense_type: 'fixed' | 'hybrid';
  budget_limit?: number;
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
    pocket_id: 0,
    concept_name: '',
    amount: 0,
    payment_day: 1,
    expense_type: 'fixed',
    budget_limit: 0
  };

  constructor(
    public dialogRef: MatDialogRef<ExpenseFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExpenseFormData
  ) {}

  ngOnInit(): void {
    if (this.data.isEditing && this.data.expense) {
      this.formData = {
        pocket_id: this.data.expense.pocket_id,
        concept_name: this.data.expense.concept_name,
        amount: this.data.expense.amount,
        payment_day: this.data.expense.payment_day,
        expense_type: this.data.expense.expense_type || 'fixed',
        budget_limit: this.data.expense.budget_limit || 0
      };
      
      // Verificar si el pocket_id existe en availablePockets
      const pocketExists = this.data.availablePockets.find(p => p.id === this.data.expense?.pocket_id);
      if (!pocketExists) {
        console.warn('ExpenseFormModal - El pocket_id del gasto no existe en availablePockets:', {
          expensePocketId: this.data.expense.pocket_id,
          availablePockets: this.data.availablePockets.map(p => ({ id: p.id, name: p.name }))
        });
      }
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
    const baseValid = !!(
      this.formData.pocket_id &&
      this.formData.concept_name.trim() &&
      this.formData.expense_type
    );

    if (this.formData.expense_type === 'fixed') {
      return baseValid && 
        this.formData.amount > 0 &&
        this.formData.payment_day >= 1 &&
        this.formData.payment_day <= 31;
    } else if (this.formData.expense_type === 'hybrid') {
      return baseValid && 
        this.formData.budget_limit !== undefined &&
        this.formData.budget_limit > 0;
    }

    return false;
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];

    if (!('pocket_id' in this.formData) || !this.formData.pocket_id) {
      errors.push('Selecciona un bolsillo');
    }

    if (!('concept_name' in this.formData) || !this.formData.concept_name.trim()) {
      errors.push('Ingresa el concepto del gasto');
    }

    if (!this.formData.expense_type) {
      errors.push('Selecciona el tipo de gasto');
    }

    if (this.formData.expense_type === 'fixed') {
      if (this.formData.amount <= 0) {
        errors.push('El monto debe ser mayor a 0');
      }
      
      if (this.formData.payment_day < 1 || this.formData.payment_day > 31) {
        errors.push('El día de pago debe estar entre 1 y 31');
      }
    } else if (this.formData.expense_type === 'hybrid') {
      if (!this.formData.budget_limit || this.formData.budget_limit <= 0) {
        errors.push('El presupuesto mensual debe ser mayor a 0');
      }
    }
    
    return errors;
  }

  getTitle(): string {
    if (this.data.isEditing) {
      return this.formData.expense_type === 'hybrid' ? 'Editar Gasto Híbrido' : 'Editar Gasto Fijo';
    } else {
      return this.formData.expense_type === 'hybrid' ? 'Agregar Gasto Híbrido' : 'Agregar Gasto Fijo';
    }
  }

  getSaveButtonText(): string {
    return this.data.isEditing ? 'Guardar Cambios' : 'Agregar Gasto';
  }

  getSaveButtonIcon(): string {
    return this.data.isEditing ? 'save' : 'add';
  }

  onExpenseTypeChange(): void {
    // Limpiar campos específicos cuando cambia el tipo
    if (this.formData.expense_type === 'fixed') {
      this.formData.budget_limit = 0;
      if (!this.formData.amount) {
        this.formData.amount = 0;
      }
      if (!this.formData.payment_day) {
        this.formData.payment_day = 1;
      }
    } else if (this.formData.expense_type === 'hybrid') {
      this.formData.amount = 0;
      this.formData.payment_day = 1;
      if (!this.formData.budget_limit) {
        this.formData.budget_limit = 0;
      }
    }
  }

  getExpenseTypeHint(): string {
    if (this.formData.expense_type === 'fixed') {
      return 'Monto fijo que se paga en una fecha específica cada mes';
    } else if (this.formData.expense_type === 'hybrid') {
      return 'Presupuesto variable que se consume en múltiples transacciones';
    }
    return 'Selecciona el tipo de gasto que deseas crear';
  }

  /**
   * Obtiene el nombre del bolsillo seleccionado
   */
  getSelectedPocketName(): string {
    const selectedPocket = this.data.availablePockets.find(p => p.id === this.formData.pocket_id);
    return selectedPocket ? selectedPocket.name : 'Bolsillo no encontrado';
  }

  /**
   * Verifica si hay bolsillos disponibles
   */
  hasAvailablePockets(): boolean {
    return this.data.availablePockets && this.data.availablePockets.length > 0;
  }
}