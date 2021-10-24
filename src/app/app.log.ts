import {environment} from '../environments/environment';
import * as Debug from 'debug';

export function debugLog(message?: any, ...optionalParams: any[]): void {
  const debug = Debug('romb:debug');
  if (environment.production !== true) {
    debug(arguments);
    console.log.apply(console, arguments);
  }
}

export function errorLog(message?: any, ...optionalParams: any[]): void {
  const debug = Debug('romb:error');
  if (environment.production !== true) {
    debug(arguments);
    console.error.apply(console, arguments);
    // Error.captureStackTrace(this, console.error);
  }
}
