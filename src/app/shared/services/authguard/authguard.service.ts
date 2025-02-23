import {Injectable} from '@angular/core';
import {CanActivate, Router, UrlTree} from "@angular/router";
import {AuthService} from "../auth/auth.service";
import {map, Observable} from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {
    constructor(private authService: AuthService, private router: Router) {
    }

    canActivate(): Observable<boolean | UrlTree> {
        return this.authService.isAuthenticated$.pipe(
            map(isAuth => isAuth ? true : this.router.createUrlTree(['/login']))
        );
    }
}
