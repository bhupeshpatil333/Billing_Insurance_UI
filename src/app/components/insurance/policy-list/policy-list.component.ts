import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../shared/material.module';
import { InsuranceService, Policy } from '../../../core/services/insurance.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PolicyCreateDialogComponent } from '../../shared/dialogs/policy-create-dialog/policy-create-dialog.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    selector: 'app-policy-list',
    standalone: true,
    imports: [CommonModule, MaterialModule, FormsModule],
    templateUrl: './policy-list.component.html',
    styleUrl: './policy-list.component.scss'
})
export class PolicyListComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    policies: Policy[] = [];
    filteredPolicies: Policy[] = [];
    searchTerm: string = '';
    filterStatus: string = 'all'; // all, active, expired, expiring
    isLoading: boolean = false;

    displayedColumns: string[] = ['policyNumber', 'coveragePercentage', 'validFrom', 'validTo', 'status', 'actions'];

    constructor(
        private insuranceService: InsuranceService,
        private dialog: MatDialog,
        private snackBar: MatSnackBar
    ) { }

    ngOnInit(): void {
        this.loadPolicies();
    }

    loadPolicies(): void {
        this.isLoading = true;
        this.insuranceService.getAllPolicies(true) // Force refresh
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: (policies) => {
                    this.policies = policies;
                    this.applyFilters();
                    this.isLoading = false;
                    this.checkExpiringPolicies();
                },
                error: (error) => {
                    console.error('Error loading policies:', error);
                    this.snackBar.open('Error loading policies: ' + error.message, 'Close', { duration: 5000 });
                    this.isLoading = false;
                }
            });
    }

    applyFilters(): void {
        let filtered = [...this.policies];

        // Apply search filter
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.policyNumber.toLowerCase().includes(term)
            );
        }

        // Apply status filter
        if (this.filterStatus !== 'all') {
            const today = new Date();
            filtered = filtered.filter(p => {
                const validTo = new Date(p.validTo || '');
                const daysUntilExpiry = Math.ceil((validTo.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                switch (this.filterStatus) {
                    case 'active':
                        return validTo > today;
                    case 'expired':
                        return validTo <= today;
                    case 'expiring':
                        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
                    default:
                        return true;
                }
            });
        }

        this.filteredPolicies = filtered;
    }

    onSearchChange(): void {
        this.applyFilters();
    }

    onFilterChange(): void {
        this.applyFilters();
    }

    getPolicyStatus(policy: Policy): string {
        const today = new Date();
        const validFrom = new Date(policy.validFrom || '');
        const validTo = new Date(policy.validTo || '');
        const daysUntilExpiry = Math.ceil((validTo.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (validTo < today) {
            return 'expired';
        } else if (validFrom > today) {
            return 'upcoming';
        } else if (daysUntilExpiry <= 30) {
            return 'expiring';
        } else {
            return 'active';
        }
    }

    getStatusColor(status: string): string {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'expiring': return 'bg-yellow-100 text-yellow-800';
            case 'expired': return 'bg-red-100 text-red-800';
            case 'upcoming': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    getActivePoliciesCount(): number {
        return this.policies.filter(p => this.getPolicyStatus(p) === 'active').length;
    }

    getExpiringPoliciesCount(): number {
        return this.policies.filter(p => this.getPolicyStatus(p) === 'expiring').length;
    }

    getExpiredPoliciesCount(): number {
        return this.policies.filter(p => this.getPolicyStatus(p) === 'expired').length;
    }

    checkExpiringPolicies(): void {
        const today = new Date();
        const expiringPolicies = this.policies.filter(p => {
            const validTo = new Date(p.validTo || '');
            const daysUntilExpiry = Math.ceil((validTo.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
        });

        if (expiringPolicies.length > 0) {
            this.snackBar.open(
                `⚠️ ${expiringPolicies.length} policy(ies) expiring within 30 days!`,
                'View',
                { duration: 10000 }
            ).onAction().subscribe(() => {
                this.filterStatus = 'expiring';
                this.applyFilters();
            });
        }
    }

    openCreateDialog(): void {
        const dialogRef = this.dialog.open(PolicyCreateDialogComponent, {
            width: '600px'
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.createPolicy(result);
            }
        });
    }

    openEditDialog(policy: Policy): void {
        const dialogRef = this.dialog.open(PolicyCreateDialogComponent, {
            width: '600px',
            data: policy // Pass existing policy data for editing
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.updatePolicy(policy.policyId!, result);
            }
        });
    }

    createPolicy(policyData: any): void {
        this.isLoading = true;
        this.insuranceService.createPolicy(policyData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.snackBar.open('Policy created successfully!', 'Close', { duration: 3000 });
                    this.loadPolicies();
                },
                error: (error) => {
                    this.snackBar.open('Error creating policy: ' + error.message, 'Close', { duration: 5000 });
                    this.isLoading = false;
                }
            });
    }

    updatePolicy(policyId: number, policyData: any): void {
        this.isLoading = true;
        this.insuranceService.updatePolicy(policyId, policyData)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: () => {
                    this.snackBar.open('Policy updated successfully!', 'Close', { duration: 3000 });
                    this.loadPolicies();
                },
                error: (error) => {
                    this.snackBar.open('Error updating policy: ' + error.message, 'Close', { duration: 5000 });
                    this.isLoading = false;
                }
            });
    }

    deactivatePolicy(policy: Policy): void {
        if (confirm(`Are you sure you want to deactivate policy ${policy.policyNumber}?`)) {
            this.isLoading = true;
            this.insuranceService.deactivatePolicy(policy.policyId!)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                    next: () => {
                        this.snackBar.open('Policy deactivated successfully!', 'Close', { duration: 3000 });
                        this.loadPolicies();
                    },
                    error: (error) => {
                        this.snackBar.open('Error deactivating policy: ' + error.message, 'Close', { duration: 5000 });
                        this.isLoading = false;
                    }
                });
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
