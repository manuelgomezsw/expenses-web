import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';

export interface AddHybridTransactionData {
  expenseName: string;
  remainingBudget: number;
}

export interface AddHybridTransactionResult {
  amount: number | null;
  description?: string;
  transaction_date: string;
}

@Component({
  selector: 'app-add-hybrid-transaction-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule
  ],
  template: `
    <div class="add-transaction-modal">
      <h2 mat-dialog-title>
        <mat-icon>add_circle</mat-icon>
        Nueva Transacción
      </h2>

      <mat-dialog-content>
        <div class="expense-info">
          <span class="expense-name">{{ data.expenseName }}</span>
          <span class="available-budget">Disponible: {{ data.remainingBudget | currency:'COP':'symbol':'1.0-0' }}</span>
        </div>

        <form class="transaction-form">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Monto</mat-label>
            <input matInput 
                   type="number" 
                   [(ngModel)]="formData.amount"
                   name="amount"
                   placeholder="Ingresa el monto"
                   min="1"
                   [max]="data.remainingBudget"
                   required>
            <span matTextPrefix>$</span>
            <mat-hint>Máximo: {{ data.remainingBudget | currency:'COP':'symbol':'1.0-0' }}</mat-hint>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Fecha</mat-label>
            <input matInput 
                   [matDatepicker]="picker"
                   [(ngModel)]="formData.transaction_date"
                   name="transaction_date"
                   required>
            <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Descripción (Opcional)</mat-label>
            <input matInput 
                   [(ngModel)]="formData.description"
                   name="description"
                   placeholder="Ej: Gasolina estación Shell...">
          </mat-form-field>
        </form>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onCancel()">
          <mat-icon>close</mat-icon>
          Cancelar
        </button>
        <button mat-raised-button 
                color="primary" 
                (click)="onSave()"
                [disabled]="!isFormValid()">
          <mat-icon>save</mat-icon>
          Guardar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .add-transaction-modal {
      min-width: 400px;
      max-width: 500px;
    }

    .expense-info {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      margin-bottom: 24px;
    }

    .expense-name {
      font-weight: 600;
      color: #1976d2;
    }

    .available-budget {
      font-size: 14px;
      color: #4caf50;
      font-weight: 500;
    }

    .transaction-form {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .full-width {
      width: 100%;
    }

    mat-dialog-title {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #1976d2;
      margin-bottom: 16px;
    }

    mat-dialog-content {
      padding: 0 24px 16px 24px;
    }

    mat-dialog-actions {
      padding: 16px 24px;
    }

    @media (max-width: 768px) {
      .add-transaction-modal {
        min-width: 300px;
        max-width: 90vw;
      }
    }
  `]
})
export class AddHybridTransactionModalComponent {
  formData: AddHybridTransactionResult = {
    amount: null,
    description: '',
    transaction_date: new Date().toISOString().split('T')[0]
  };

  constructor(
    private dialogRef: MatDialogRef<AddHybridTransactionModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddHybridTransactionData
  ) {}

  isFormValid(): boolean {
    return this.formData.amount !== null &&
           this.formData.amount > 0 && 
           this.formData.amount <= this.data.remainingBudget &&
           !!this.formData.transaction_date;
  }

  onSave(): void {
    if (this.isFormValid()) {
      // Asegurar que amount sea un número válido antes de enviar
      const result: AddHybridTransactionResult = {
        ...this.formData,
        amount: this.formData.amount || 0
      };
      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
