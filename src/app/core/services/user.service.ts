import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { environment } from '../../../environment/environment';

import { User, CreateUserRequest, UpdateRoleRequest, UpdateStatusRequest, ApiResponse } from '../Interfaces/interfaces';

@Injectable({
    providedIn: 'root'
})
export class UserService {

    private api = environment.apiUrl + '/users';

    constructor(private http: HttpClient) { }

    getUsers(): Observable<User[]> {
        return this.http.get<ApiResponse<User[]>>(this.api).pipe(
            map(response => {
                if (!response.success) {
                    throw new Error(response.message);
                }
                return response.data;
            }),
            tap(users => console.log(`Retrieved ${users.length} users`)),
            catchError(this.handleError)
        );
    }

    createUser(data: CreateUserRequest): Observable<User> {
        return this.http.post<ApiResponse<User>>(this.api, data).pipe(
            map(response => {
                if (!response.success) {
                    throw new Error(response.message);
                }
                return response.data;
            }),
            tap(user => console.log('User created:', user)),
            catchError(this.handleError)
        );
    }

    updateUserRole(userId: string, role: 'Admin' | 'Billing' | 'Insurance'): Observable<void> {
        const payload: UpdateRoleRequest = { role };
        return this.http.put<ApiResponse<void>>(`${this.api}/${userId}/role`, payload).pipe(
            map(response => {
                if (!response.success) {
                    throw new Error(response.message);
                }
                return response.data;
            }),
            tap(() => console.log('User role updated')),
            catchError(this.handleError)
        );
    }

    updateUserStatus(userId: string, isActive: boolean): Observable<void> {
        const payload: UpdateStatusRequest = { isActive };
        return this.http.put<ApiResponse<void>>(`${this.api}/${userId}/status`, payload).pipe(
            map(response => {
                if (!response.success) {
                    throw new Error(response.message);
                }
                return response.data;
            }),
            tap(() => console.log('User status updated')),
            catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error occurred';

        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else if (error.error?.message) {
            // Handle API response with message
            errorMessage = error.error.message;
        } else {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }

        console.error('User Service Error:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}
