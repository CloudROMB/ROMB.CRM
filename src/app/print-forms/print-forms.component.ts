import {Component, OnInit, Input, ViewChild, ElementRef} from '@angular/core';

@Component({
  selector: 'romb-print-forms',
  templateUrl: './print-forms.component.html',
  styleUrls: ['./print-forms.component.scss']
})

export class PrintFormsComponent implements OnInit {
  @Input() item: any;
  @ViewChild('printFormContainer') printForms: ElementRef;

  constructor() {
  }

  ngOnInit() {
  }

  printTab(templateId: string) {
    let template;
    this.printForms.nativeElement.childNodes.forEach(element => {
      if (element.id && element.id === templateId) {
        template = element.innerHTML;
      }
    });
    if (template) {
      let popupWin;
      popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
      popupWin.document.open();
      popupWin.document.write(`
        <html>
          <head>
            <title>Print tab</title>
            <style>
            </style>
          </head>
        <body
          style="width: 100%; display: flex; align-items: center; justify-content: space-around;"
          onload="window.print();window.close()">${template}</body>
        </html>
      `);
      popupWin.document.close();
    } else {
      // console.log('PRINT ERROR: there is no content with ID:', templateId);
    }
  }
}
