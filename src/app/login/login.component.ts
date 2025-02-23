import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {MatLabel} from "@angular/material/form-field";
import {AuthService} from "../shared/services/auth/auth.service";
import {Router} from "@angular/router";

@Component({
    selector: 'app-login',
    imports: [
        ReactiveFormsModule,
        MatFormField,
        MatInput,
        MatButton,
        MatLabel
    ],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css'
})
export class LoginComponent {
    loginForm: FormGroup;

    constructor(private fb: FormBuilder,
                private authService: AuthService,
                private router: Router) {
        this.loginForm = this.fb.group({
            username: ['', Validators.required],
            password: ['', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.loginForm.valid) {
            const {username, password} = this.loginForm.value;
            this.authService.login(username, password).subscribe({
                next: () => this.router.navigate(['/expenses/daily']),
                error: (err) => console.error('Error de autenticación', err)
            });
        }
    }
}
