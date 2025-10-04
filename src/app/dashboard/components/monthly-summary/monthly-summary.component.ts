import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Pipes
import { CurrencyPipe } from '@angular/common';

// Services and Models
import { SummaryService, MonthlySummary } from '../../services/summary.service';
import { NotificationService } from '../../../services/notification/notification.service';

@Component({
  selector: 'app-monthly-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatProgressSpinnerModule,
    CurrencyPipe
  ],
  templateUrl: './monthly-summary.component.html',
  styleUrl: './monthly-summary.component.css'
})
export class MonthlySummaryComponent implements OnInit, OnDestroy, OnChanges {
  @Input() currentMonth: string = '2024-01';
  @Input() isCollapsed: boolean = false;
  @Output() toggleCollapse = new EventEmitter<void>();

  summary: MonthlySummary | null = null;
  isLoading = false;
  error: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private summaryService: SummaryService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadSummary();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentMonth'] && !changes['currentMonth'].firstChange) {
      this.loadSummary();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Carga el resumen financiero del mes
   */
  private loadSummary(): void {
    this.isLoading = true;
    this.error = null;

    this.summaryService.getMonthlySummary(this.currentMonth)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (summary) => {
          this.summary = summary;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading monthly summary:', error);
          this.error = 'Error cargando el resumen mensual';
          this.isLoading = false;
          this.notificationService.openSnackBar('Error cargando el resumen mensual');
        }
      });
  }

  /**
   * Recarga el resumen (útil para refrescar datos)
   */
  refreshSummary(): void {
    this.loadSummary();
  }

  /**
   * Obtiene el nombre del mes en español
   */
  getMonthName(): string {
    if (!this.currentMonth) return '';

    const [year, monthNum] = this.currentMonth.split('-');
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const monthIndex = parseInt(monthNum) - 1;
    return `${monthNames[monthIndex]} ${year}`;
  }


  /**
   * Obtiene el porcentaje de gastos fijos sobre el salario
   */
  getFixedExpensesPercentage(): number {
    if (!this.summary || this.summary.salary.monthly_amount === 0) return 0;
    return (this.summary.totalFixedExpenses / this.summary.salary.monthly_amount) * 100;
  }

  /**
   * Obtiene el porcentaje de gastos diarios sobre el salario
   */
  getDailyExpensesPercentage(): number {
    if (!this.summary || this.summary.salary.monthly_amount === 0) return 0;
    return (this.summary.dailyExpensesBudget.monthly_budget / this.summary.salary.monthly_amount) * 100;
  }

  onToggleCollapse(): void {
    this.toggleCollapse.emit();
  }
}