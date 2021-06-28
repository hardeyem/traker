import { Controller } from '@nestjs/common';
import { AppLogger } from '../../core';
import { ConnectedUserService } from '../../shared';
import { EventGateway } from '../../websocket';

@Controller('connectedUser')
export class ConnectedUserController {
    constructor(
        private connectedSvc: ConnectedUserService,
        private logger: AppLogger,
        private websocketGatewayProvider: EventGateway,
    ) {}
}
