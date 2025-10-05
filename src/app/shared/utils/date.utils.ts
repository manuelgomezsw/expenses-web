import { Injectable } from '@angular/core';

/**
 * Utilidades para manejo de fechas y meses
 * Centraliza toda la lógica relacionada con fechas para evitar duplicación
 */
@Injectable({
  providedIn: 'root'
})
export class DateUtils {

  /**
   * Nombres completos de los meses en español
   */
  static readonly MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  /**
   * Nombres cortos de los meses en español
   */
  static readonly MONTH_NAMES_SHORT = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
  ];

  /**
   * Nombres de los días de la semana en español
   */
  static readonly DAY_NAMES = [
    'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ];

  /**
   * Obtiene el mes actual en formato YYYY-MM
   * Reemplaza los métodos getCurrentMonth() duplicados en múltiples componentes
   */
  static getCurrentMonth(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  /**
   * Convierte un string de mes (YYYY-MM) a nombre legible
   * Reemplaza los métodos getMonthName() duplicados en múltiples componentes
   * 
   * @param monthString - Mes en formato "YYYY-MM"
   * @returns Nombre del mes en formato "Enero 2024"
   */
  static getMonthName(monthString: string): string {
    if (!monthString || !this.isValidMonth(monthString)) {
      return '';
    }

    const [year, monthNum] = monthString.split('-');
    const monthIndex = parseInt(monthNum) - 1;
    
    if (monthIndex < 0 || monthIndex >= 12) {
      return '';
    }
    
    return `${this.MONTH_NAMES[monthIndex]} ${year}`;
  }

  /**
   * Obtiene el nombre corto del mes para un índice dado
   * 
   * @param monthIndex - Índice del mes (0-11)
   * @returns Nombre corto del mes (ej: "Ene")
   */
  static getShortMonthName(monthIndex: number): string {
    if (monthIndex < 0 || monthIndex >= 12) {
      return '';
    }
    return this.MONTH_NAMES_SHORT[monthIndex];
  }

  /**
   * Obtiene el nombre del día de la semana para un índice dado
   * 
   * @param dayIndex - Índice del día (0-6, donde 0 = Domingo)
   * @returns Nombre del día (ej: "Lunes")
   */
  static getDayName(dayIndex: number): string {
    if (dayIndex < 0 || dayIndex >= 7) {
      return '';
    }
    return this.DAY_NAMES[dayIndex];
  }

  /**
   * Valida si un string tiene el formato de mes válido (YYYY-MM)
   * Centraliza la validación que estaba duplicada
   * 
   * @param month - String a validar
   * @returns true si es un formato válido
   */
  static isValidMonth(month: string): boolean {
    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(month)) {
      return false;
    }

    const [year, monthNum] = month.split('-');
    const yearNum = parseInt(year);
    const monthIndex = parseInt(monthNum);

    // Validar rangos razonables
    return yearNum >= 2020 && yearNum <= 2030 && monthIndex >= 1 && monthIndex <= 12;
  }

  /**
   * Formatea una fecha para mostrar en formato legible
   * Utilizado por CustomDatePipe
   * 
   * @param date - Fecha a formatear
   * @returns Fecha formateada
   */
  static formatDate(date: Date): string {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const target = new Date(date.getTime());
    target.setHours(0, 0, 0, 0);

    const diffTime = now.getTime() - target.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoy';
    }

    if (diffDays === 1) {
      return 'Ayer';
    }

    if (diffDays === 2) {
      return 'Antier';
    }

    if (diffDays < 7 && diffDays > 2) {
      return this.getDayName(date.getDay());
    } else {
      const month = this.getShortMonthName(date.getMonth());
      const day = date.getDate();
      return `${month} ${day}`;
    }
  }

  /**
   * Obtiene la fecha actual en formato YYYY-MM-DD
   * 
   * @returns Fecha actual en formato ISO
   */
  static getCurrentDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  /**
   * Convierte una fecha a formato YYYY-MM-DD
   * 
   * @param date - Fecha a convertir
   * @returns Fecha en formato ISO
   */
  static formatDateToISO(date: Date): string {
    return date.toISOString().split('T')[0];
  }
}
