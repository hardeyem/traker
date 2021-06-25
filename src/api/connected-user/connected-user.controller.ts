import { Controller } from '@nestjs/common';
import { AppLogger } from 'src/core';
import { ConnectedUserService } from 'src/shared/services/connected-user/connected-user.service';
import { EventGateway } from 'src/websocket/event-gateway';

@Controller('connectedUser')
export class ConnectedUserController {
    constructor(
        private connectedSvc: ConnectedUserService,
        private logger: AppLogger,
        private websocketGatewayProvider: EventGateway,
    ) {}
}
