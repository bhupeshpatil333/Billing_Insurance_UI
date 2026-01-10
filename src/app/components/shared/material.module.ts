import { NgModule } from "@angular/core";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatTableModule } from "@angular/material/table";
import { MatIconModule } from "@angular/material/icon";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatSelectModule } from "@angular/material/select";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatNativeDateModule } from "@angular/material/core";
import { MatSnackBarModule } from "@angular/material/snack-bar";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatDialogModule } from "@angular/material/dialog";
import { MatListModule } from "@angular/material/list";
import { MatSortModule } from "@angular/material/sort";
import { MatTooltipModule } from "@angular/material/tooltip";

@NgModule({
    exports: [
        MatInputModule,
        MatButtonModule,
        MatTableModule,
        MatIconModule,
        MatToolbarModule,
        MatCardModule,
        MatFormFieldModule,
        MatSelectModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatSnackBarModule,
        MatPaginatorModule,
        MatDialogModule,
        MatListModule,
        MatSortModule,
        MatTooltipModule
    ]
})
export class MaterialModule { }
