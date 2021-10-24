import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'cutCell'
})
export class CutcellPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    if (value
      && typeof value === 'string'
      && typeof args === 'number'
      && args > 0
      && value.length > args
    ) {
      return value.slice(0, args) + '...';
    } else {
      return value;
    }
  }
}
