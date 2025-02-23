import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
    name: 'status'
})
export class StatusPipe implements PipeTransform {
    mode: 'Default' | 'YesNo' = 'Default';

    transform(status: boolean, mode?: 'Default' | 'YesNo'): string {
        // Si se pasa un parámetro mode, lo usamos; si no, usamos la propiedad del pipe.
        const currentMode = mode || this.mode;
        if (currentMode === 'Default') {
            return status ? 'Activo' : 'Inactivo';
        } else if (currentMode === 'YesNo') {
            return status ? 'Si' : 'No';
        }
        return '';
    }

}
