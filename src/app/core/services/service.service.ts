import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environment/environment';

import { ApiResponse, AppServiceItem, CreateServiceRequest } from '../Interfaces/interfaces';

@Injectable({
    providedIn: 'root'
})
export class ServiceService {
    private api = environment.apiUrl + '/services';

    constructor(private http: HttpClient) { }

    /**
     * GET /api/services
     * Returns active services by default if called without admin context, 
     * but generally used for all services list in admin.
     */
    getServices(): Observable<AppServiceItem[]> {
        return this.http.get<ApiResponse<AppServiceItem[]>>(this.api).pipe(
            map(response => {
                if (!response.success) throw new Error(response.message);
                return response.data;
            }),
            catchError(this.handleError)
        );
    }

    /**
     * POST /api/services
     * Admin only: create a new service
     */
    createService(data: CreateServiceRequest): Observable<AppServiceItem> {
        return this.http.post<ApiResponse<AppServiceItem>>(this.api, data).pipe(
            map(response => {
                if (!response.success) throw new Error(response.message);
                return response.data;
            }),
            catchError(this.handleError)
        );
    }

    /**
     * PUT /api/services/{id}
     * Admin only: update service name or cost
     */
    updateService(id: number, data: CreateServiceRequest): Observable<AppServiceItem> {
        return this.http.put<ApiResponse<AppServiceItem>>(`${this.api}/${id}`, data).pipe(
            map(response => {
                if (!response.success) throw new Error(response.message);
                return response.data;
            }),
            catchError(this.handleError)
        );
    }

    /**
     * DELETE /api/services/{id}
     * Admin only: soft delete (sets isActive = false)
     */
    disableService(id: number): Observable<void> {
        return this.http.delete<ApiResponse<void>>(`${this.api}/${id}`).pipe(
            map(response => {
                if (!response.success) throw new Error(response.message);
                return response.data;
            }),
            catchError(this.handleError)
        );
    }

    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'An unknown error occurred';
        if (error.error instanceof ErrorEvent) {
            errorMessage = `Error: ${error.error.message}`;
        } else if (error.error?.message) {
            errorMessage = error.error.message;
        } else {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
        }
        console.error('Service Master Error:', errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}
