import { FluentClient } from '@fluent-org/logger';
import * as Transport from 'winston-transport';

export class FluentTransport extends Transport {
  private fluentClient: FluentClient;

  constructor(
    opts: Transport.TransportStreamOptions & { fluentClient: FluentClient },
  ) {
    super(opts);
    this.fluentClient = opts.fluentClient;
  }

  log(info: any, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });
    this.fluentClient.emit(info.level, info);
    callback();
  }
}
