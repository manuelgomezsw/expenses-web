import {Injectable} from '@angular/core';
import {HttpInterceptor, HttpHandler, HttpRequest, HttpEvent, HttpErrorResponse} from '@angular/common/http';
import {Router} from "@angular/router";
import {catchError, Observable, throwError} from 'rxjs';

import {AuthService} from '../../services/auth/auth.service';
import {NotificationService} from "../../services/notification/notification.service";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
    constructor(
        private authService: AuthService,
        private router: Router,
        private notificationService: NotificationService)
    {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Obtenemos el token del servicio de autenticación
        const token = this.authService.getToken();

        // Si existe el token, lo validamos usando isTokenExpired
        if (token && this.authService.isTokenExpired(token)) {
            this.authService.logout();
            this.router.navigate(['/login']);

            console.log(new Error('Token expirado'))
            this.notificationService.openSnackBar('Token expirado')
        }

        // Si el token existe y no está expirado, lo agregamos al header de la petición
        const authReq = token ? req.clone({
            headers: req.headers.set('Authorization', `Bearer ${token}`)
        }) : req;

        return next.handle(authReq).pipe(
            catchError((error: HttpErrorResponse) => {
                console.log(error)
                this.notificationService.openSnackBar('Ups... Parece que no tenemos permisos.')
                // Aquí podrías agregar lógica para manejar errores 401 u otros,
                // pero la verificación del token se realizó previamente
                return throwError(() => error);
            })
        );
    }
}