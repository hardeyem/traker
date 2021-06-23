import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { EventGateway } from './event-gateway';
import { WsAdapter } from '@nestjs/platform-ws';
import { io } from "socket.io-client";
import { rejects } from 'assert';


async function createNestApp(...gateways): Promise<INestApplication> {
  const testingModule = await Test.createTestingModule({
    providers: gateways,
  }).compile();
  const app = await testingModule.createNestApplication();
  app.useWebSocketAdapter(new WsAdapter(app) as any);
  return app;
}

fdescribe('EventGateway', () => {
  let provider: EventGateway; 
  let ws, app;
  const baseAddress = "http://localhost:80";

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventGateway],
    }).compile();

    provider = module.get<EventGateway>(EventGateway);

    // app = await createNestApp(EventGateway);
    // await app.listenAsync(8000);

  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should connect to websocket', async () => {
    
    ws = io(baseAddress, {transports:["websocket"]});

    ws.emit('events', "Connected message");
    await new Promise((resolve, reject) => {
      ws.on('message', msg => {
        console.log("message recieved");
        expect(JSON.parse(msg).data).toBe(true);
        resolve(true);
      })
    });
  });
});
