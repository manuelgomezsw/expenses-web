import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-month-selector',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './month-selector.component.html',
  styleUrl: './month-selector.component.css'
})
export class MonthSelectorComponent {
  @Input() currentMonth: string = '2024-01'; // Format YYYY-MM
  @Output() monthChanged = new EventEmitter<string>();

  /**
   * Navega al mes anterior
   */
  goToPreviousMonth(): void {
    const [year, month] = this.currentMonth.split('-').map(Number);
    const date = new Date(year, month - 2); // month - 1 for zero-based, -1 more for previous
    const newMonth = this.formatMonth(date);
    this.monthChanged.emit(newMonth);
  }

  /**
   * Navega al mes siguiente
   */
  goToNextMonth(): void {
    const [year, month] = this.currentMonth.split('-').map(Number);
    const date = new Date(year, month); // month - 1 for zero-based, +1 for next = month
    const newMonth = this.formatMonth(date);
    this.monthChanged.emit(newMonth);
  }

  /**
   * Navega al mes actual
   */
  goToCurrentMonth(): void {
    const now = new Date();
    const currentMonth = this.formatMonth(now);
    this.monthChanged.emit(currentMonth);
  }

  /**
   * Obtiene el nombre del mes en español
   */
  getMonthName(): string {
    if (!this.currentMonth) return '';

    const [year, monthNum] = this.currentMonth.split('-').map(Number);
    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    
    const monthIndex = monthNum - 1;
    return `${monthNames[monthIndex]} ${year}`;
  }

  /**
   * Verifica si el mes actual es el mes presente
   */
  isCurrentMonth(): boolean {
    const now = new Date();
    const currentMonth = this.formatMonth(now);
    return this.currentMonth === currentMonth;
  }

  /**
   * Verifica si se puede navegar al mes anterior (limitar a 2 años atrás)
   */
  canGoToPrevious(): boolean {
    const [year, month] = this.currentMonth.split('-').map(Number);
    const currentDate = new Date(year, month - 1);
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    return currentDate > twoYearsAgo;
  }

  /**
   * Verifica si se puede navegar al mes siguiente (limitar a 1 año adelante)
   */
  canGoToNext(): boolean {
    const [year, month] = this.currentMonth.split('-').map(Number);
    const currentDate = new Date(year, month - 1);
    const oneYearAhead = new Date();
    oneYearAhead.setFullYear(oneYearAhead.getFullYear() + 1);
    
    return currentDate < oneYearAhead;
  }

  /**
   * Formatea una fecha como YYYY-MM
   */
  private formatMonth(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }
}