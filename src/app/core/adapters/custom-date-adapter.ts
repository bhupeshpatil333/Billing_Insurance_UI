import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {

    override parse(value: any): Date | null {
        if ((typeof value === 'string') && (value.indexOf('-') > -1)) {
            const str = value.split('-');
            const day = Number(str[0]);
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            const month = monthNames.indexOf(str[1]);
            const year = Number(str[2]);
            return new Date(year, month, day);
        }
        const timestamp = typeof value === 'number' ? value : Date.parse(value);
        return isNaN(timestamp) ? null : new Date(timestamp);
    }

    override format(date: Date, displayFormat: Object): string {
        if (displayFormat === 'input') {
            const day = date.getDate();
            const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
            ];
            const month = monthNames[date.getMonth()];
            const year = date.getFullYear();
            return `${this._to2digit(day)}-${month}-${year}`;
        }
        return date.toLocaleDateString();
    }

    private _to2digit(n: number) {
        return ('00' + n).slice(-2);
    }
}

export const CUSTOM_DATE_FORMATS = {
    parse: {
        dateInput: 'input',
    },
    display: {
        dateInput: 'input',
        monthYearLabel: { year: 'numeric', month: 'short' },
        dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
        monthYearA11yLabel: { year: 'numeric', month: 'long' },
    },
};
