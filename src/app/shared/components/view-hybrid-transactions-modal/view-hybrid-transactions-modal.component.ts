import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FixedExpense, HybridTransaction } from '../../../domain/fixed-expense';

export interface ViewHybridTransactionsData {
  expense: FixedExpense;
}

export interface ViewHybridTransactionsResult {
  action: 'delete';
  transactionId: number;
}

@Component({
  selector: 'app-view-hybrid-transactions-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTooltipModule
  ],
  template: `
    <div class="view-transactions-modal">
      <h2 mat-dialog-title>
        <mat-icon>visibility</mat-icon>
        {{ data.expense.concept_name }}
      </h2>

      <mat-dialog-content>
        <!-- Resumen del Gasto -->
        <div class="expense-summary">
          <div class="budget-info">
            <div class="budget-item">
              <span class="label">Presupuesto:</span>
              <span class="value budget">{{ getBudgetLimit() | currency:'COP':'symbol':'1.0-0' }}</span>
            </div>
            <div class="budget-item">
              <span class="label">Gastado:</span>
              <span class="value spent">{{ getCurrentSpent() | currency:'COP':'symbol':'1.0-0' }}</span>
            </div>
            <div class="budget-item">
              <span class="label">Disponible:</span>
              <span class="value" [class.available]="getRemainingBudget() > 0" [class.exceeded]="getRemainingBudget() < 0">
                {{ getRemainingBudget() | currency:'COP':'symbol':'1.0-0' }}
              </span>
            </div>
          </div>
          
          <div class="progress-container">
            <mat-progress-bar 
              mode="determinate" 
              [value]="getProgressPercentage()"
              [color]="getProgressColor()">
            </mat-progress-bar>
            <span class="progress-text">{{ getProgressPercentage() | number:'1.0-0' }}%</span>
          </div>
        </div>

        <!-- Lista de Transacciones -->
        <div class="transactions-section" *ngIf="getTransactions().length > 0">
          <h3>
            <mat-icon>history</mat-icon>
            Transacciones ({{ getTransactions().length }})
          </h3>
          
          <div class="transactions-list">
            <div class="transaction-item" *ngFor="let transaction of getTransactions(); trackBy: trackByTransactionId">
              <div class="transaction-info">
                <div class="transaction-header">
                  <span class="amount">{{ transaction.amount | currency:'COP':'symbol':'1.0-0' }}</span>
                  <span class="date">{{ transaction.transaction_date | date:'dd/MM/yyyy' }}</span>
                </div>
                <div class="description" *ngIf="transaction.description">
                  {{ transaction.description }}
                </div>
              </div>
              
              <div class="transaction-actions">
                <button mat-icon-button 
                        color="warn"
                        (click)="deleteTransaction(transaction)"
                        matTooltip="Eliminar transacción">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Estado vacío -->
        <div class="empty-state" *ngIf="getTransactions().length === 0">
          <mat-icon>receipt</mat-icon>
          <h4>Sin Transacciones</h4>
          <p>Aún no has registrado ninguna transacción para este gasto híbrido.</p>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button (click)="onClose()">
          <mat-icon>close</mat-icon>
          Cerrar
        </button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .view-transactions-modal {
      min-width: 500px;
      max-width: 600px;
      max-height: 80vh;
    }

    /* Expense Summary */
    .expense-summary {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: 1px solid #dee2e6;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }

    .budget-info {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .budget-item {
      text-align: center;
    }

    .budget-item .label {
      display: block;
      font-size: 12px;
      color: #6c757d;
      margin-bottom: 4px;
      font-weight: 500;
    }

    .budget-item .value {
      display: block;
      font-size: 16px;
      font-weight: 700;
    }

    .budget-item .value.budget {
      color: #1976d2;
    }

    .budget-item .value.spent {
      color: #ff9800;
    }

    .budget-item .value.available {
      color: #4caf50;
    }

    .budget-item .value.exceeded {
      color: #f44336;
    }

    .progress-container {
      position: relative;
    }

    .progress-text {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 12px;
      font-weight: 600;
      color: #ffffff;
      text-shadow: 0 1px 2px rgba(0,0,0,0.3);
    }

    /* Transactions Section */
    .transactions-section h3 {
      display: flex;
      align-items: center;
      gap: 8px;
      margin: 0 0 16px 0;
      font-size: 16px;
      font-weight: 600;
      color: #1976d2;
    }

    .transactions-list {
      max-height: 300px;
      overflow-y: auto;
      padding-right: 4px;
    }

    .transaction-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      border: 1px solid #f0f0f0;
      border-radius: 8px;
      margin-bottom: 8px;
      background: #fafafa;
      transition: all 0.2s ease;
    }

    .transaction-item:hover {
      background: #f5f5f5;
      border-color: #e0e0e0;
    }

    .transaction-item:last-child {
      margin-bottom: 0;
    }

    .transaction-info {
      flex: 1;
    }

    .transaction-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 4px;
    }

    .transaction-header .amount {
      font-size: 14px;
      font-weight: 600;
      color: #1976d2;
    }

    .transaction-header .date {
      font-size: 12px;
      color: #757575;
    }

    .description {
      font-size: 12px;
      color: #6c757d;
      font-style: italic;
    }

    .transaction-actions {
      display: flex;
      gap: 4px;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: #6c757d;
    }

    .empty-state mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 16px;
      color: #dee2e6;
    }

    .empty-state h4 {
      margin: 0 0 8px 0;
      font-size: 18px;
      font-weight: 600;
    }

    .empty-state p {
      margin: 0;
      font-size: 14px;
      line-height: 1.4;
    }

    /* Scrollbar */
    .transactions-list::-webkit-scrollbar {
      width: 6px;
    }

    .transactions-list::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 3px;
    }

    .transactions-list::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 3px;
    }

    .transactions-list::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }

    /* Dialog Styles */
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

    /* Responsive */
    @media (max-width: 768px) {
      .view-transactions-modal {
        min-width: 300px;
        max-width: 95vw;
      }

      .budget-info {
        grid-template-columns: 1fr;
        gap: 12px;
      }

      .transactions-list {
        max-height: 250px;
      }
    }
  `]
})
export class ViewHybridTransactionsModalComponent {
  constructor(
    private dialogRef: MatDialogRef<ViewHybridTransactionsModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ViewHybridTransactionsData
  ) {}

  getBudgetLimit(): number {
    return this.data.expense.budget_limit || 0;
  }

  getCurrentSpent(): number {
    return this.data.expense.current_spent || 0;
  }

  getRemainingBudget(): number {
    return this.getBudgetLimit() - this.getCurrentSpent();
  }

  getProgressPercentage(): number {
    const budgetLimit = this.getBudgetLimit();
    if (budgetLimit === 0) return 0;
    return Math.min((this.getCurrentSpent() / budgetLimit) * 100, 100);
  }

  getProgressColor(): 'primary' | 'accent' | 'warn' {
    const percentage = this.getProgressPercentage();
    if (percentage < 80) return 'primary';
    if (percentage < 95) return 'accent';
    return 'warn';
  }

  getTransactions(): HybridTransaction[] {
    return this.data.expense.transactions || [];
  }

  trackByTransactionId(index: number, transaction: HybridTransaction): number {
    return transaction.id || index;
  }

  deleteTransaction(transaction: HybridTransaction): void {
    if (!transaction.id) {
      console.error('No se puede eliminar transacción: ID no definido');
      return;
    }
    
    const result: ViewHybridTransactionsResult = {
      action: 'delete',
      transactionId: transaction.id
    };
    this.dialogRef.close(result);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
