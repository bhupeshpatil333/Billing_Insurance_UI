/**
 * Centralized interfaces for the application
 */

// General API Response
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

// Service Master (Moved up to debug resolution)
export interface AppServiceItem {
    serviceId: number;
    serviceName: string;
    cost: number;
    isActive: boolean;
}

export interface CreateServiceRequest {
    serviceName: string;
    cost: number;
    isActive: boolean;
}

// Authentication
export interface LoginResponse {
    token: string;
    role: string;
    user?: any;
    username?: string;
}

// Billing
export interface BillResponse {
    billId: number;
    id?: number;
    patientId: number;
    grossAmount: number;
    insuranceAmount: number;
    netPayable: number;
    invoiceNumber: string;
    status?: string;
    insurancePercentage?: number;
    createdAt: string;
}

export interface GenerateBillRequest {
    patientId: number;
    services: Array<{
        serviceId: number;
        quantity: number;
    }>;
}

// Insurance
export interface InsuranceProvider {
    id: string;
    name: string;
    contactInfo: string;
}

export interface Policy {
    policyId?: number;
    id?: string;
    providerId?: string;
    policyNumber: string;
    coverageAmount: number;
    coveragePercentage?: number;
    validFrom?: string;
    validTo?: string;
}

export interface CreatePolicyRequest {
    policyNumber: string;
    coveragePercentage: number;
    validFrom: string;
    validTo: string;
}

export interface DashboardStats {
    patients: number;
    bills: number;
    revenue: number;
    policies: number;
}

export interface AssignPolicyRequest {
    patientId: number;
    policyId: number;
}

// Patient
export interface Patient {
    patientId?: number;
    fullName: string;
    mobile: string;
    dob: string;
}

// Reports
export interface BillingReportItem {
    title: string;
    totalAmount: number;
}

export interface PaymentReportData {
    totalPayments: number;
    totalAmount: number;
}

export interface InsuranceReportData {
    totalInsuranceCovered: number;
    totalBills: number;
}

// User Management
export interface User {
    userId: string;
    email: string;
    role: 'Admin' | 'Billing' | 'Insurance';
    isActive: boolean;
}

export interface CreateUserRequest {
    email: string;
    password: string;
    role: 'Admin' | 'Billing' | 'Insurance';
}

export interface UpdateRoleRequest {
    role: 'Admin' | 'Billing' | 'Insurance';
}

export interface UpdateStatusRequest {
    isActive: boolean;
}

// Payment
export interface PaymentResponse {
    billId: number;
    status: string;
    totalPaid: number;
}

export interface CreatePaymentRequest {
    billId: number;
    paidAmount: number;
    paymentMode: 'Cash' | 'UPI' | 'Card';
}
