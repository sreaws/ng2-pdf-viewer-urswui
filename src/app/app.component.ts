import {
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import {
  degrees,
  PDFDocument,
  rgb,
  StandardFonts,
  PDFPage,
  PDFFont,
  setLineCap,
} from 'pdf-lib';
import { auditTime } from 'rxjs';
import * as fontkit from '@pdf-lib/fontkit';
import {
  CdkDragEnd,
  CdkDragMove,
  Point,
  DragRef,
} from '@angular/cdk/drag-drop';
import { ResizeEvent } from 'angular-resizable-element';
import { error } from 'pdf-lib/es/utils/errors';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  encapsulation: ViewEncapsulation.None,
  template: `
		<ckeditor
			[(data)]="templateHtml">
		</ckeditor>
	`,
})
export class AppComponent implements OnInit {
  src = 'https://vadimdez.github.io/ng2-pdf-viewer/assets/pdf-test.pdf';
  originalPdfBytes: Uint8Array;
  pdfByteArray: Uint8Array;
  openSansFont: ArrayBuffer;

  pdfWidth: string;
  pdfHeight: string;

  public templateHtml: string;

  loading = false;
  buttionText = 'Submit';

  http: HttpClient;

  @ViewChild('pdf') pdfEl: ElementRef;

  dragPositions;
  coordinates = new FormGroup({
    generalSettings: new FormGroup({
      expoName: new FormControl(),
      startDate: new FormControl(),
      finishDate: new FormControl(),
    }),

    mailSettings: new FormGroup({
      userName: new FormControl(),
      userPassword: new FormControl(),
      from: new FormControl('', [Validators.required, Validators.email]),
      to: new FormControl('', [Validators.required, Validators.email]),
      cc: new FormControl(),
      bcc: new FormControl(),
      templateHtml:
        new FormControl(`<p><img alt="mountain" src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHwMmhYVWs0DXTql_YO1a7VqfYaUYrlNkg4fibqVeXyQ&amp;s" style="float:left; height:128px; margin:6px; width:192px" />weqwke jlqw elkqwlk ejqlwkje lkqwjl kejqwlk ejqlkwj elkqjw mekqwm elm eqlkwme lkqwm lkemqwlk melqwm lkeqwm elqmwlemqwlkem qwe</p>
      `),
    }),

    pdfSettings: new FormGroup({
      name: new FormGroup({
        x: new FormControl(0),
        y: new FormControl(0),
        w: new FormControl(200),
        h: new FormControl(200),
        fontSize: new FormControl(20),
        previewText: new FormControl('name'),
      }),

      eMail: new FormControl('örnek@gmail.com'),

      phoneNumber: new FormControl('05315909029'),

      companyName: new FormGroup({
        x: new FormControl(200),
        y: new FormControl(0),
        w: new FormControl(200),
        h: new FormControl(200),
        fontSize: new FormControl(20),
        previewText: new FormControl('company name'),
      }),

      title: new FormGroup({
        x: new FormControl(400),
        y: new FormControl(0),
        w: new FormControl(200),
        h: new FormControl(200),
        fontSize: new FormControl(20),
        previewText: new FormControl('title'),
      }),

      sector: new FormControl('Sector'),

      country: new FormControl('Turkey'),
      city: new FormControl('Antalya'),

      visitorCheck: new FormGroup({
        x: new FormControl(0),
        y: new FormControl(200),
        w: new FormControl(200),
        h: new FormControl(200),
        fontSize: new FormControl(20),
        previewText: new FormControl('Pick Visitor/Exhibitor'),
      }),

      gridSize: new FormControl(20),
    }),
  });

  selected = new FormControl(2);

  offset = new FormGroup({
    x: new FormControl(100),
    y: new FormControl(100),
  });

  async ngOnInit() {
    // console.log(this.http.test);
    this.openSansFont = await fetch(
      'https://db.onlinewebfonts.com/t/3f650b0bd14fc655ba4e672b5805db95.ttf'
    ).then((res) => res.arrayBuffer());
    console.log('Font OK');
    this.coordinates.valueChanges.pipe(auditTime(200)).subscribe(() => {
      this.modifyPdf();
    });
    this.offset.valueChanges.pipe(auditTime(200)).subscribe(() => {
      this.modifyPdf();
    });

    this.dragPositions = this.coordinates.value.pdfSettings;

    // this.dragPositions.name.x += this.offset.value.x;
    // this.dragPositions.name.y += this.offset.value.y;
  }

  onFileChange(e: Event) {
    const reader = new FileReader();
    const fileByteArray = [];

    reader.readAsArrayBuffer((e.target as HTMLInputElement).files[0]);
    reader.onloadend = async (evt: any) => {
      if (evt.target.readyState === FileReader.DONE) {
        const arrayBuffer = evt.target.result;
        this.originalPdfBytes = new Uint8Array(arrayBuffer);

        this.modifyPdf();
      }
    };
  }

  onDrag(item: string, e: CdkDragMove) {
    const { x, y } = e.source.getFreeDragPosition();
    this.coordinates
      .get('pdfSettings')
      .get(item)
      .get('x')
      .setValue(x - this.offset.value.x);
    this.coordinates
      .get('pdfSettings')
      .get(item)
      .get('y')
      .setValue(y - this.offset.value.y);
  }

  // [cdkDragConstrainPosition]="computeDragRenderPos('name')"

  // computeDragRenderPos(item) {
  //   const component = this;
  //   return (pos: Point, dragRef: DragRef) => {
  //     // const { x, y } = dragRef.getFreeDragPosition();
  //     const x = component.coordinates
  //       .get('pdfSettings')
  //       .get(item)
  //       .get('x').value;
  //     const y = component.coordinates
  //       .get('pdfSettings')
  //       .get(item)
  //       .get('y').value;
  //     const gridSize = component.coordinates.get('pdfSettings').value.gridSize;

  //     // snapX,Y are coordiantes of grid relative to pdf box
  //     const snapX = Math.floor(x / gridSize) * gridSize;
  //     const snapY = Math.floor(y / gridSize) * gridSize;

  //     const x2 = pos.x + (snapX - x);
  //     // const y2 = pos.y + (snapY - y);

  //     // console.log('pos', pos);
  //     // console.log('x2 y2', x2, y2);
  //     return {
  //       x: pos.x + (Math.floor(x  / gridSize) * gridSize - x),
  //       y: pos.y + (Math.floor(y / gridSize) * gridSize - y),
  //     } as Point;
  //   };
  // }

  onDragEnd(item: string, e: CdkDragEnd) {
    let { x, y } = e.source.getFreeDragPosition();
    const gridSize = this.coordinates.get('pdfSettings').value.gridSize;

    const snapX = Math.floor(x / gridSize) * gridSize;
    const snapY = Math.floor(y / gridSize) * gridSize;
    if (Math.abs(snapX - x) > gridSize / 2)
      x = (Math.floor(x / gridSize) + 1) * gridSize;
    else x = Math.floor(x / gridSize) * gridSize;

    if (Math.abs(snapY - y) > gridSize / 2)
      y = (Math.floor(y / gridSize) + 1) * gridSize;
    else y = Math.floor(y / gridSize) * gridSize;

    this.coordinates
      .get('pdfSettings')
      .get(item)
      .get('x')
      .setValue(x - this.offset.value.x);
    this.coordinates
      .get('pdfSettings')
      .get(item)
      .get('y')
      .setValue(y - this.offset.value.y);
    console.log('x, y', x, y);
    this.dragPositions[item].x = x - this.offset.value.x;
    this.dragPositions[item].y = y - this.offset.value.y;
  }

  onResizeEnd(item: string, e: ResizeEvent) {
    const gridSize = this.coordinates.get('pdfSettings').value.gridSize;
    const formGroup = this.coordinates.get('pdfSettings').get(item);
    if (e.edges.left) {
      let snap = Math.floor((e.edges.left as number) / gridSize) * gridSize;
      formGroup.get('x').setValue(formGroup.get('x').value + snap);
      formGroup.get('w').setValue(formGroup.get('w').value - snap);
    }

    if (e.edges.right) {
      let snap = Math.floor((e.edges.right as number) / gridSize) * gridSize;
      formGroup.get('w').setValue(formGroup.get('w').value + snap);
    }

    if (e.edges.top) {
      let snap = Math.floor((e.edges.top as number) / gridSize) * gridSize;
      formGroup.get('y').setValue(formGroup.get('y').value + snap);
      formGroup.get('h').setValue(formGroup.get('h').value - snap);
    }

    if (e.edges.bottom) {
      let snap = Math.floor((e.edges.bottom as number) / gridSize) * gridSize;
      formGroup.get('h').setValue(formGroup.get('h').value + snap);
    }
    this.dragPositions = this.coordinates.value.pdfSettings;
  }

  async modifyPdf() {
    const pdfDoc = await PDFDocument.load(this.originalPdfBytes);

    pdfDoc.registerFontkit(fontkit);

    const openSansFont = await pdfDoc.embedFont(this.openSansFont);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();
    this.pdfWidth = width + 'px';
    this.pdfHeight = height + 'px';

    const coordinates = this.coordinates.value.pdfSettings;

    this.drawCenteredAndWrappedText(firstPage, openSansFont, coordinates.name);

    this.drawCenteredAndWrappedText(
      firstPage,
      openSansFont,
      coordinates.visitorCheck
    );

    this.drawCenteredAndWrappedText(firstPage, openSansFont, coordinates.title);

    this.drawCenteredAndWrappedText(
      firstPage,
      openSansFont,
      coordinates.companyName
    );
    // const values = this.coordinates.controls.value;
    // firstPage.drawRectangle({
    //   x: values.x,
    //   y: height - values.y,
    //   width: values.w,
    //   height: -values.h,
    //   borderColor: rgb(1, 0, 0),
    //   borderWidth: 1,
    // });

    this.pdfByteArray = await pdfDoc.save();
  }

  drawCenteredAndWrappedText(
    firstPage: PDFPage,
    openSansFont: PDFFont,
    {
      previewText,
      fontSize,
      x,
      y,
      w,
      h,
    }: {
      previewText: string;
      fontSize: number;
      x: number;
      y: number;
      w: number;
      h: number;
    }
  ) {
    const { width, height } = firstPage.getSize();
    let lines = [];
    let i = 0;
    for (let word of previewText.split(' ')) {
      lines[i] ??= '';
      const newWidth = openSansFont.widthOfTextAtSize(
        lines[i] + word,
        fontSize
      );
      if (newWidth < w) {
        lines[i] = lines[i] + ' ' + word;
      } else {
        i++;
        lines[i] ??= word;
      }
    }

    lines.forEach((line, i) => {
      const name = line;
      const textWidth = openSansFont.widthOfTextAtSize(name, fontSize);
      const textHeight = openSansFont.heightAtSize(fontSize);

      const leftSpace = (w - textWidth) / 2;
      const topSpace = (h - textHeight * lines.length) / 2;

      firstPage.drawText(name, {
        x: leftSpace + x + this.offset.value.x,
        y:
          -topSpace +
          height -
          textHeight -
          y +
          fontSize * 0.25 -
          textHeight * i -
          this.offset.value.y,
        size: fontSize,
        font: openSansFont,
        color: rgb(0.95, 0.1, 0.1),
      });
    });
  }
  printAllForm() {
    console.log(this.coordinates.value);
  }
  getDataFromCKEditor() {
    console.log(this.templateHtml);
  }
}
