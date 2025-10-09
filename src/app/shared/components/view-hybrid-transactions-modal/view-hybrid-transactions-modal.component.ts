import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

import { FixedExpense, HybridTransaction } from '../../../domain/fixed-expense';
import { ConfirmDialogComponent } from '../../../components/confirm-dialog/confirm-dialog.component';

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
        {{ data.expense.pocket_name }} - {{ data.expense.concept_name }}
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
          </div>
          <div class="progress-text">{{ getProgressPercentage() | number:'1.0-0' }}%</div>
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
                <div class="action-buttons">
                  <button mat-icon-button 
                          color="warn"
                          (click)="deleteTransaction(transaction)"
                          matTooltip="Eliminar transacción"
                          class="delete-button">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
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
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
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
      margin-bottom: 8px;
    }

    .progress-text {
      text-align: center;
      font-size: 12px;
      font-weight: 600;
      color: #666666;
      margin-top: 4px;
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
      overflow-x: hidden;
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
      position: relative;
      min-width: 0;
      box-sizing: border-box;
    }

    .transaction-item:hover {
      background: #f5f5f5;
      border-color: #e0e0e0;
    }

    .transaction-item:hover .action-buttons {
      opacity: 1;
      visibility: visible;
      transform: translateX(0);
    }

    .transaction-item:last-child {
      margin-bottom: 0;
    }

    .transaction-info {
      flex: 1;
      min-width: 0;
      overflow: hidden;
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
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .transaction-actions {
      display: flex;
      align-items: center;
    }

    .action-buttons {
      display: flex;
      gap: 4px;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease;
      transform: translateX(10px);
    }

    .delete-button {
      width: 32px !important;
      height: 32px !important;
      min-width: 32px !important;
      padding: 0 !important;
      color: #f44336 !important;
    }

    .delete-button:hover {
      background: rgba(244, 67, 54, 0.1) !important;
    }

    .delete-button mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
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
    @Inject(MAT_DIALOG_DATA) public data: ViewHybridTransactionsData,
    private dialog: MatDialog
  ) {}

  getBudgetLimit(): number {
    return this.data.expense.budget_limit || 0;
  }

  getCurrentSpent(): number {
    // Calcular la suma de todas las transacciones en el modal
    const transactions = this.getTransactions();
    const totalSpent = transactions.reduce((total, transaction) => total + transaction.amount, 0);
    return totalSpent;
  }

  getRemainingBudget(): number {
    const remaining = this.getBudgetLimit() - this.getCurrentSpent();
    return remaining;
  }

  getProgressPercentage(): number {
    const budgetLimit = this.getBudgetLimit();
    const currentSpent = this.getCurrentSpent();
    if (budgetLimit === 0) return 0;
    
    const percentage = Math.min((currentSpent / budgetLimit) * 100, 100);
    return percentage;
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

    const transactionDescription = transaction.description || 
      `COP${transaction.amount.toLocaleString()} del ${new Date(transaction.transaction_date).toLocaleDateString('es-CO')}`;
    
    const confirmDialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        message: `¿Estás seguro de que quieres eliminar la transacción "${transactionDescription}"?`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar'
      }
    });

    confirmDialogRef.afterClosed().subscribe((confirmed) => {
      if (confirmed === true) {
        const result: ViewHybridTransactionsResult = {
          action: 'delete',
          transactionId: transaction.id!
        };
        this.dialogRef.close(result);
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
