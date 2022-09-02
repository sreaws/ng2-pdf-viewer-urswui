import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PdfViewerModule } from 'ng2-pdf-viewer'; // <- import PdfViewerModule

import { AppComponent } from './app.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { ResizableModule } from 'angular-resizable-element';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CKEditorModule } from 'ckeditor4-angular';
import { HttpClientModule } from '@angular/common/http';
import { NgxPrintModule } from 'ngx-print';
import {MatTabsModule} from '@angular/material/tabs';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    PdfViewerModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    DragDropModule,
    ResizableModule,
    CKEditorModule,
    HttpClientModule,
    NgxPrintModule,
  ],
  declarations: [AppComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
