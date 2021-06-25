import { LoggerService, Logger } from '@nestjs/common';

/**
 * Standard logging to STDOUT, can be extended to log to other type of stream.
 */
export class AppLogger extends Logger implements LoggerService {

  constructor() {
      super();
  }


  log(message: string, data:any = null) {
    super.log(message, data);
    console.log(message);
  }

  error(message: string, trace: string) {
    super.error(message, trace);
    console.error(message);
    console.error(trace);
  }

  warn(message: string, data: any = null) {
    super.warn(message, data);
  }

  debug(message: string) {
    super.debug(message);
    console.debug(message);
  }

  verbose(message: string) {
    super.verbose(message);
    console.log(message);
  }
}