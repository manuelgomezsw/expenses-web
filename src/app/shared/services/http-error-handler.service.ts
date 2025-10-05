import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';

import { NotificationService } from '../../services/notification/notification.service';

/**
 * Interfaz para errores del backend
 */
export interface BackendErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
}

/**
 * Servicio centralizado para manejo de errores HTTP
 * Reemplaza los métodos handleHttpError duplicados en múltiples servicios
 */
@Injectable({
  providedIn: 'root'
})
export class HttpErrorHandlerService {

  constructor(private notificationService: NotificationService) {}

  /**
   * Maneja errores HTTP de manera consistente
   * Centraliza la lógica que estaba duplicada en ConfigurationService, 
   * FixedExpensesService y DailyExpensesService
   * 
   * @param error - Error HTTP recibido
   * @param showNotification - Si debe mostrar notificación al usuario (default: true)
   * @returns Observable que propaga el error
   */
  handleError(error: HttpErrorResponse, showNotification: boolean = true): Observable<never> {
    console.error('HTTP Error Details:', {
      status: error.status,
      statusText: error.statusText,
      error: error.error,
      url: error.url,
      timestamp: new Date().toISOString()
    });

    let message: string;

    if (error.status === 0) {
      // Error de red (servidor no disponible)
      message = 'No se pudo conectar al servidor. Verificando disponibilidad...';
    } else if (error.status >= 400 && error.status < 500) {
      // Errores 4xx: mostrar el mensaje del backend si está disponible
      const backendError = error.error as BackendErrorResponse;
      message = backendError?.error || backendError?.message || 'Error en la solicitud';
    } else if (error.status >= 500) {
      // Errores 5xx: mensaje genérico
      message = 'Ocurrió un error interno. Por favor, inténtalo nuevamente.';
    } else {
      // Otros errores
      message = 'Error de conexión. Por favor, inténtalo nuevamente.';
    }

    // Mostrar notificación al usuario si está habilitado
    if (showNotification) {
      this.notificationService.openSnackBar(message);
    }

    return throwError(() => error);
  }

  /**
   * Maneja errores de manera silenciosa (sin notificación)
   * Útil para casos donde el componente maneja el error de forma específica
   * 
   * @param error - Error HTTP recibido
   * @returns Observable que propaga el error
   */
  handleSilentError(error: HttpErrorResponse): Observable<never> {
    return this.handleError(error, false);
  }

  /**
   * Obtiene un mensaje de error legible para el usuario
   * Sin propagar el error, solo para obtener el mensaje
   * 
   * @param error - Error HTTP recibido
   * @returns Mensaje de error legible
   */
  getErrorMessage(error: HttpErrorResponse): string {
    if (error.status === 0) {
      return 'No se pudo conectar al servidor';
    } else if (error.status >= 400 && error.status < 500) {
      const backendError = error.error as BackendErrorResponse;
      return backendError?.error || backendError?.message || 'Error en la solicitud';
    } else if (error.status >= 500) {
      return 'Error interno del servidor';
    } else {
      return 'Error de conexión';
    }
  }

  /**
   * Verifica si un error es de tipo "no encontrado" (404)
   * 
   * @param error - Error HTTP recibido
   * @returns true si es un error 404
   */
  isNotFoundError(error: HttpErrorResponse): boolean {
    return error.status === 404;
  }

  /**
   * Verifica si un error es de tipo "no autorizado" (401/403)
   * 
   * @param error - Error HTTP recibido
   * @returns true si es un error de autorización
   */
  isAuthError(error: HttpErrorResponse): boolean {
    return error.status === 401 || error.status === 403;
  }

  /**
   * Verifica si un error es de red (sin conexión)
   * 
   * @param error - Error HTTP recibido
   * @returns true si es un error de red
   */
  isNetworkError(error: HttpErrorResponse): boolean {
    return error.status === 0;
  }
}
