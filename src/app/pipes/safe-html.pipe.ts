import {Pipe, PipeTransform} from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';

@Pipe({
  name: 'safeHtml'
})
export class SafeHtmlPipe implements PipeTransform {

  transform(value: any, args?: any): any {
    let val;
    // val = this.sanitizer.bypassSecurityTrustStyle(value);
    val = this.sanitizer.bypassSecurityTrustHtml(value);
    return val;

    // return this.sanitizer.bypassSecurityTrustStyle(value);
    // return this.sanitizer.bypassSecurityTrustHtml(value);
    // return this.sanitizer.bypassSecurityTrustScript(value);
    // return this.sanitizer.bypassSecurityTrustUrl(value);
    // return this.sanitizer.bypassSecurityTrustResourceUrl(value);
  }

  constructor(private sanitizer: DomSanitizer) {
  }
}
