import {Injectable} from '@angular/core';
import {BehaviorSubject, Observable, Subscription, tap, timer} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {JwtHelperService} from '@auth0/angular-jwt';

import {environment} from "../../../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private _isAuthenticated = new BehaviorSubject<boolean>(false);
    public isAuthenticated$ = this._isAuthenticated.asObservable();
    private jwtHelper = new JwtHelperService();
    private refreshSubscription: Subscription | null = null;
    private refreshThreshold = 60 * 1000; // 60,000 ms -> 60 segundos

    constructor(private http: HttpClient) {
        const token = localStorage.getItem('token');
        if (token && !this.isTokenExpired(token)) {
            this._isAuthenticated.next(true);
        } else {
            this._isAuthenticated.next(false);
            localStorage.removeItem('token');
        }
    }

    login(username: string, password: string): Observable<any> {
        return this.http.post<{ token: string }>(`${environment.authUrl}/login`, {username, password})
            .pipe(
                tap(response => {
                    localStorage.setItem('token', response.token);
                    this._isAuthenticated.next(true);
                })
            );
    }

    logout(): void {
        localStorage.removeItem('token');
        this._isAuthenticated.next(false);
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    /**
     * Verifica si el token JWT ha expirado utilizando JwtHelperService.
     * @param token El token JWT.
     * @returns true si el token está expirado, false en caso contrario.
     */
    isTokenExpired(token: string): boolean {
        return this.jwtHelper.isTokenExpired(token);
    }

    /**
     * Programa el refresco del token.
     * Calcula el tiempo restante para la expiración y, 60 segundos antes,
     * dispara la función refreshToken().
     */
    private scheduleRefresh(): void {
        const token = this.getToken();
        if (!token) return;

        const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
        if (!expirationDate) return;

        const expiresInMs = expirationDate.getTime() - Date.now();
        // Programa el refresco para 60 segundos antes de que expire el token
        const refreshTime = expiresInMs - this.refreshThreshold;

        if (refreshTime <= 0) {
            // Si ya se pasó el umbral, refrescamos inmediatamente
            this.refreshToken();
        } else {
            if (this.refreshSubscription) {
                this.refreshSubscription.unsubscribe();
            }
            this.refreshSubscription = timer(refreshTime).subscribe(() => this.refreshToken());
        }
    }

    /**
     * Realiza la llamada para refrescar el token.
     * Se asume que existe un endpoint en el backend para refrescar tokens.
     */
    private refreshToken(): void {
        // Realiza la petición al endpoint de refresco. Por ejemplo:
        this.http.post<{ token: string }>(`${environment.authUrl}/refresh`, {})
            .pipe(
                tap(response => {
                    localStorage.setItem('token', response.token);
                    this._isAuthenticated.next(true);
                    // Reprograma el refresco para el nuevo token
                    this.scheduleRefresh();
                })
            )
            .subscribe({
                error: (err) => {
                    console.error('Error refrescando el token', err);
                    // Si refrescar falla, cierra sesión o redirige al login
                    this.logout();
                }
            });
    }
}
