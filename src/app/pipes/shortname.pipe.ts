import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortname'
})
export class ShortnamePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return null;
  }

}
