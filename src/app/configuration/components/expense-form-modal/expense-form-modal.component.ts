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
  month: string;                    // ✅ AGREGAR para backend
  expense_type: 'fixed' | 'hybrid';
  
  // Campos condicionales según tipo
  amount?: number;                  // ✅ Opcional para híbridos
  payment_day?: number;             // ✅ Opcional para híbridos  
  budget_limit?: number;            // ✅ Opcional para fijos
}

export interface ExpenseConversionWarning {
  isConversion: boolean;
  fromType: 'fixed' | 'hybrid';
  toType: 'fixed' | 'hybrid';
  willLoseTransactions: boolean;
  transactionCount: number;
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
    month: '',
    expense_type: 'fixed',
    amount: 0,
    payment_day: 1,
    budget_limit: 0
  };

  // Variables para detectar conversiones
  originalExpenseType: 'fixed' | 'hybrid' = 'fixed';
  originalAmount: number = 0;
  originalBudgetLimit: number = 0;

  constructor(
    public dialogRef: MatDialogRef<ExpenseFormModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExpenseFormData
  ) {}

  ngOnInit(): void {
    // Obtener el mes actual para nuevos gastos
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    
    if (this.data.isEditing && this.data.expense) {
      // Guardar valores originales para detectar conversiones
      this.originalExpenseType = this.data.expense.expense_type || 'fixed';
      this.originalAmount = this.data.expense.amount || 0;
      this.originalBudgetLimit = this.data.expense.budget_limit || 0;
      
      this.formData = {
        pocket_id: this.data.expense.pocket_id,
        concept_name: this.data.expense.concept_name,
        month: this.data.expense.month || currentMonth,
        expense_type: this.data.expense.expense_type || 'fixed',
        amount: this.data.expense.amount,
        payment_day: this.data.expense.payment_day,
        budget_limit: this.data.expense.budget_limit
      };
      
      // Verificar si el pocket_id existe en availablePockets
      const pocketExists = this.data.availablePockets.find(p => p.id === this.data.expense?.pocket_id);
      if (!pocketExists) {
        console.warn('ExpenseFormModal - El pocket_id del gasto no existe en availablePockets:', {
          expensePocketId: this.data.expense.pocket_id,
          availablePockets: this.data.availablePockets.map(p => ({ id: p.id, name: p.name }))
        });
      }
    } else {
      // Nuevo gasto
      this.formData.month = currentMonth;
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
      this.formData.expense_type &&
      this.formData.month
    );

    if (!baseValid) return false;

    // Validaciones específicas por tipo
    if (this.formData.expense_type === 'fixed') {
      return !!(this.formData.amount && this.formData.amount > 0 &&
               this.formData.payment_day && this.formData.payment_day >= 1 && 
               this.formData.payment_day <= 31);
    } else if (this.formData.expense_type === 'hybrid') {
      return !!(this.formData.budget_limit && this.formData.budget_limit > 0);
    }

    return false;
  }

  getValidationErrors(): string[] {
    const errors: string[] = [];

    if (!this.formData.pocket_id) {
      errors.push('Selecciona un bolsillo');
    }

    if (!this.formData.concept_name.trim()) {
      errors.push('Ingresa el concepto del gasto');
    }

    if (!this.formData.expense_type) {
      errors.push('Selecciona el tipo de gasto');
    }

    if (!this.formData.month) {
      errors.push('Selecciona el mes');
    }

    // Validaciones específicas por tipo
    if (this.formData.expense_type === 'fixed') {
      if (!this.formData.amount || this.formData.amount <= 0) {
        errors.push('El monto debe ser mayor a 0');
      }
      
      if (!this.formData.payment_day || this.formData.payment_day < 1 || this.formData.payment_day > 31) {
        errors.push('El día de pago debe estar entre 1 y 31');
      }
    } else if (this.formData.expense_type === 'hybrid') {
      if (!this.formData.budget_limit || this.formData.budget_limit <= 0) {
        errors.push('El presupuesto mensual debe ser mayor a 0');
      }
    }

    // Validaciones de conversión
    if (this.data.isEditing && this.isConversion()) {
      const conversionInfo = this.getConversionInfo();
      if (conversionInfo.fromType === 'fixed' && conversionInfo.toType === 'hybrid') {
        if (!this.formData.budget_limit && this.originalAmount <= 0) {
          errors.push('Proporciona un presupuesto o el gasto debe tener un monto > 0');
        }
      } else if (conversionInfo.fromType === 'hybrid' && conversionInfo.toType === 'fixed') {
        if (!this.formData.payment_day) {
          errors.push('Debes proporcionar un día de pago válido para gastos fijos');
        }
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
    // Manejar conversiones inteligentes
    if (this.data.isEditing && this.originalExpenseType !== this.formData.expense_type) {
      // Es una conversión
      if (this.formData.expense_type === 'hybrid' && !this.formData.budget_limit) {
        // Fixed → Hybrid: Copiar amount → budget_limit si no hay budget_limit
        this.formData.budget_limit = this.originalAmount || 0;
      } else if (this.formData.expense_type === 'fixed' && !this.formData.amount) {
        // Hybrid → Fixed: Copiar budget_limit → amount si no hay amount
        this.formData.amount = this.originalBudgetLimit || 0;
        if (!this.formData.payment_day) {
          this.formData.payment_day = 1;
        }
      }
    }

    // Limpiar campos específicos cuando cambia el tipo
    if (this.formData.expense_type === 'fixed') {
      if (!this.data.isEditing || this.originalExpenseType === 'hybrid') {
        this.formData.budget_limit = undefined;
      }
      if (!this.formData.amount) {
        this.formData.amount = 0;
      }
      if (!this.formData.payment_day) {
        this.formData.payment_day = 1;
      }
    } else if (this.formData.expense_type === 'hybrid') {
      if (!this.data.isEditing || this.originalExpenseType === 'fixed') {
        this.formData.amount = undefined;
        this.formData.payment_day = undefined;
      }
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

  /**
   * Detecta si se está realizando una conversión de tipo
   */
  isConversion(): boolean {
    return this.data.isEditing && this.originalExpenseType !== this.formData.expense_type;
  }

  /**
   * Obtiene información sobre la conversión
   */
  getConversionInfo(): ExpenseConversionWarning {
    const isConversion = this.isConversion();
    const transactionCount = this.data.expense?.transactions?.length || 0;
    
    return {
      isConversion,
      fromType: this.originalExpenseType,
      toType: this.formData.expense_type,
      willLoseTransactions: isConversion && 
                           this.originalExpenseType === 'hybrid' && 
                           this.formData.expense_type === 'fixed' && 
                           transactionCount > 0,
      transactionCount
    };
  }

  /**
   * Obtiene mensaje de advertencia para conversiones
   */
  getConversionWarning(): string {
    if (!this.isConversion()) return '';
    
    const info = this.getConversionInfo();
    
    if (info.fromType === 'hybrid' && info.toType === 'fixed' && info.willLoseTransactions) {
      return `⚠️ Al convertir a gasto fijo se eliminarán permanentemente ${info.transactionCount} transacciones.`;
    } else if (info.fromType === 'fixed' && info.toType === 'hybrid') {
      return `ℹ️ Al convertir a gasto híbrido podrás registrar múltiples transacciones.`;
    }
    
    return '';
  }

  /**
   * Verifica si la conversión es destructiva
   */
  isDestructiveConversion(): boolean {
    const info = this.getConversionInfo();
    return info.willLoseTransactions;
  }
}