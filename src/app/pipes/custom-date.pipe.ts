import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {
    transform(value: Date | string | null | undefined): string {
        if (!value) {
            return '';
        }

        // Arreglo de días y meses en español
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        const monthNamesShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

        // Convertir a Date si viene como string
        const date = (value instanceof Date) ? value : new Date(value);

        // Tomar la fecha de "hoy" sin horas/minutos/segundos
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Tomar la fecha objetivo sin horas/minutos/segundos
        const target = new Date(date.getTime());
        target.setHours(0, 0, 0, 0);

        // Calcular diferencia en días (hoy - target)
        const diffTime = today.getTime() - target.getTime();
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

        // Lógica solicitada
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
            // Obtener el día de la semana en español
            return dayNames[date.getDay()];
        } else {
            // Mostrar formato "Ene 30"
            const month = monthNamesShort[date.getMonth()];
            const day = date.getDate();
            return `${month} ${day}`;
        }
    }

}
