import { Component, Inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from '../../material.module';

export type ConfirmDialogType = 'delete' | 'logout' | 'deactivate' | 'warning' | 'info';

export interface ConfirmDialogData {
  type?: ConfirmDialogType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: string;
  iconColor?: string;
  confirmButtonColor?: string;
}

interface DialogConfig {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  confirmButtonColor: string;
  confirmButtonHoverColor: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MaterialModule, MatDialogModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  dialogConfig: DialogConfig;

  private readonly typeConfigs: Record<ConfirmDialogType, DialogConfig> = {
    delete: {
      icon: 'delete',
      iconColor: '#ef4444',
      iconBgColor: 'rgba(239, 68, 68, 0.1)',
      confirmButtonColor: 'from-red-600 to-red-700',
      confirmButtonHoverColor: 'hover:from-red-700 hover:to-red-800'
    },
    logout: {
      icon: 'logout',
      iconColor: '#f59e0b',
      iconBgColor: 'rgba(245, 158, 11, 0.1)',
      confirmButtonColor: 'from-amber-600 to-orange-600',
      confirmButtonHoverColor: 'hover:from-amber-700 hover:to-orange-700'
    },
    deactivate: {
      icon: 'block',
      iconColor: '#f97316',
      iconBgColor: 'rgba(249, 115, 22, 0.1)',
      confirmButtonColor: 'from-orange-600 to-red-600',
      confirmButtonHoverColor: 'hover:from-orange-700 hover:to-red-700'
    },
    warning: {
      icon: 'warning',
      iconColor: '#eab308',
      iconBgColor: 'rgba(234, 179, 8, 0.1)',
      confirmButtonColor: 'from-yellow-600 to-amber-600',
      confirmButtonHoverColor: 'hover:from-yellow-700 hover:to-amber-700'
    },
    info: {
      icon: 'info',
      iconColor: '#3b82f6',
      iconBgColor: 'rgba(59, 130, 246, 0.1)',
      confirmButtonColor: 'from-blue-600 to-indigo-600',
      confirmButtonHoverColor: 'hover:from-blue-700 hover:to-indigo-700'
    }
  };

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    // Set defaults
    this.data.confirmText = this.data.confirmText || 'Confirm';
    this.data.cancelText = this.data.cancelText || 'Cancel';
    this.data.type = this.data.type || 'warning';

    // Get configuration based on type
    this.dialogConfig = this.typeConfigs[this.data.type];

    // Allow custom overrides
    if (this.data.icon) {
      this.dialogConfig.icon = this.data.icon;
    }
    if (this.data.iconColor) {
      this.dialogConfig.iconColor = this.data.iconColor;
    }
    if (this.data.confirmButtonColor) {
      this.dialogConfig.confirmButtonColor = this.data.confirmButtonColor;
    }
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
