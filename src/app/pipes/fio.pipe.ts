import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
  name: 'fio'
})
export class FioPipe implements PipeTransform {
  ucFirst(str) {
    if (!str) {
      return str
    } else {
      return str[0].toUpperCase() + str.slice(1);
    }
  }

  transform(value: any, args?: any): any {
    let result = value;
    if (value !== undefined) {
      result = value.trim().toLowerCase().split(' ');
      result.forEach((name, i, ar) => {
        ar[i] = this.ucFirst(name);
      });
    }
    return result.join(' ');
  }
}
