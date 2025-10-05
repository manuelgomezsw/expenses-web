import { Pipe, PipeTransform } from '@angular/core';
import { DateUtils } from '../../shared/utils/date.utils';

@Pipe({
    name: 'customDate'
})
export class CustomDatePipe implements PipeTransform {
    transform(value: Date | string | null | undefined): string {
        if (!value) {
            return '';
        }

        // Convertir a Date si viene como string
        const date = (value instanceof Date) ? value : new Date(value);

        // Usar la utilidad centralizada para formatear fechas
        return DateUtils.formatDate(date);
    }
}
