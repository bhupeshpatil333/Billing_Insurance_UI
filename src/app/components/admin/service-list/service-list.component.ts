import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../shared/material.module';
import { MatDialog } from '@angular/material/dialog';
import { ServiceService, ServiceItem, CreateServiceRequest } from '../../../core/services/service.service';
import { ServiceDialogComponent } from '../service-dialog/service-dialog.component';
import { NotificationService } from '../../../core/services/notification.service';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-service-list',
    standalone: true,
    imports: [CommonModule, MaterialModule],
    templateUrl: './service-list.component.html',
    styleUrl: './service-list.component.scss'
})
export class ServiceListComponent implements OnInit {
    services: ServiceItem[] = [];
    isLoading = false;
    displayedColumns: string[] = ['name', 'cost', 'status', 'actions'];

    constructor(
        private serviceService: ServiceService,
        private dialog: MatDialog,
        private notification: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadServices();
    }

    loadServices(): void {
        this.isLoading = true;
        this.serviceService.getServices().subscribe({
            next: (data: ServiceItem[]) => {
                this.services = data;
                this.isLoading = false;
            },
            error: (err: any) => {
                this.notification.error(err.message || 'Failed to load services');
                this.isLoading = false;
            }
        });
    }

    openServiceDialog(service?: ServiceItem): void {
        const dialogRef = this.dialog.open(ServiceDialogComponent, {
            width: '450px',
            data: service || null
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.loadServices();
            }
        });
    }

    toggleServiceStatus(service: ServiceItem): void {
        const newStatus = !service.isActive;
        const action = newStatus ? 'activate' : 'deactivate';

        // Optimized: Immediately call API without confirm dialog for simple toggle
        // or keep confirm for deactivation if preferred. Let's do direct for better UX.

        if (newStatus) {
            // Activate: Since there is no specific "Enable" endpoint, use Update
            const request: CreateServiceRequest = {
                serviceName: service.serviceName,
                cost: service.cost,
                isActive: true
            };
            this.serviceService.updateService(service.serviceId, request).subscribe({
                next: () => {
                    this.notification.success(`Service ${service.serviceName} activated`);
                    this.loadServices();
                },
                error: (err: any) => {
                    this.notification.error(err.message || 'Failed to activate service');
                    service.isActive = !newStatus; // Rollback UI if failed
                }
            });
        } else {
            // Deactivate: Use Disable endpoint
            this.serviceService.disableService(service.serviceId).subscribe({
                next: () => {
                    this.notification.success(`Service ${service.serviceName} deactivated`);
                    this.loadServices();
                },
                error: (err: any) => {
                    this.notification.error(err.message || 'Failed to deactivate service');
                    service.isActive = !newStatus; // Rollback UI if failed
                }
            });
        }
    }
}
