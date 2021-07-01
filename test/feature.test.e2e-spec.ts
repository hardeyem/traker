import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { WsAdapter } from '@nestjs/platform-ws';
import { io, Socket } from "socket.io-client";
import { rejects } from 'assert';
import { createMock } from '@golevelup/nestjs-testing';
import * as request from 'supertest';

import { 
    EventGateway, 
    SocketIoAdapter,
    SharedModule, 
    CoreModule,
    ApiModule,
    RepositoryModule,
    WebsocketModule,
    AppLogger,
    ConnectedUserService,
    ConnectedUser,
    AssetSchema,
    Asset,
    AssetService
} from '../src';
import { ConfigModule } from '@nestjs/config';
import { getModelToken, MongooseModule } from '@nestjs/mongoose';
import config from '../src/core/config/config';
import databaseConfig from '../src/core/config/database';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { Model, Query } from 'mongoose';
import { TestDatabaseModule } from './database-in-memory';


const testAsset = 'ABC_123';


describe('EventGateway', () => {
  let eventGateway: EventGateway; 
  let ws: Socket, app, conncetedUserModel, conncetedUserService: ConnectedUserService;
  let assetModel, assetService: AssetService ;
  const port = 3001;
  const baseAddress = `http://localhost:${port}`;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventGateway,
        AppService,
        AppLogger,
        ConnectedUserService,
      ],
      imports: [
        ConfigModule.forRoot({
          load: [config, databaseConfig ],
        }),
        TestDatabaseModule,
        RepositoryModule,
        ApiModule,
        WebsocketModule, 
      ],
      controllers: [AppController]
    })
    .compile();

    eventGateway = module.get<EventGateway>(EventGateway);
    conncetedUserModel = module.get<Model<ConnectedUser>>(getModelToken('ConnectedUser'));
    assetModel = module.get<Model<Asset>>(getModelToken('Asset'));
    conncetedUserService = module.get<ConnectedUserService>(ConnectedUserService);
    assetService = module.get<AssetService>(AssetService);

    app = await module.createNestApplication();
    app.useWebSocketAdapter(new SocketIoAdapter(app, true) as any);

    await app.listenAsync(port);

  });
  afterEach(async (done) => {
    if(ws){
      ws.disconnect();
      ws.close();
    }
    await app.close();
    done();
  });

  it('should be defined', () => {
    expect(eventGateway).toBeDefined();
  });

  it('should connect to database', async() => {
    const connectedUers = await conncetedUserService.getAllConnectedUsers();
    expect(connectedUers).toBeDefined();
  });

  it('should create a new asset with unique assetId', async(done) => {
    try{
      const addAsset = await request(app.getHttpServer())
      .post('/asset')
      .send({assetId: 'ABC_' + Date.now()})
      .set('Accept', 'application/json');

      expect(addAsset.statusCode).toBe(201);
      expect(addAsset.body.data).toBeDefined();

      done();
    }catch(error){
      done.fail(error);
    }
  });

  it('should not create duplicate asset', async (done) => {
    const existingAsset = await assetService.getByAssetId(testAsset);
    if(!existingAsset || !existingAsset.assetId){
      await assetService.addAsset({assetId: testAsset});
    }

    try{
      const addAsset = await request(app.getHttpServer())
      .post('/asset')
      .send({assetId: testAsset})
      .set('Accept', 'application/json');

      expect(addAsset.statusCode).toBe(400);
      expect(addAsset.body.success).toBeFalsy();
      done();
    }catch(error){
      done(error);
    }
  });

  it('should update asset position', async(done) => {
    
    try{
      const addAsset = await request(app.getHttpServer())
      .put(`/asset/${testAsset}/updateLocation`)
      .send({
        latitude: 6.508106, 
        longitude: 3.372387,
        address: 'Yaba, Lagos'
      })
      .set('Accept', 'application/json');

      expect(addAsset.statusCode).toBe(200);
      expect(addAsset.body.data.asset).toBeDefined();

      done();
    }catch(error){
      console.log(error);
      done(error);
    }
  });

  it('should not connect to websocket without required params', async (done) => {

    ws = io(baseAddress, {transports:["websocket"]});
    ws.on('disconnect', async () => {
      console.log('client disconnected');
      expect((await eventGateway.server.allSockets()).size).toEqual(0);
      ws.disconnect();
      done();
    });
    ws.on('connected', async (data) => {
      console.log('client connected wrongly');
      console.log((await eventGateway.server.allSockets()).size);
      expect((await eventGateway.server.allSockets()).size).toEqual(0);
      expect(true).toEqual(false);
      ws.disconnect();
      done();
    })

  });
  describe('Authorized client group', () => {

    beforeEach(() => {
      ws = io(baseAddress, {
        transports:["websocket"],
        query: {
          lat: '6.506523211836984',
          long: '3.3752939793162153',
          userId: 'userA'
        }
      });
    })

    afterEach(() => {
      ws.close();
    })


  it('should connect to websocket with required params', async (done) => {

    ws.on('connected', async (data) => {
      console.log('client connected rightly');
      console.log((await eventGateway.server.allSockets()).size);
      expect((await eventGateway.server.allSockets()).size).toEqual(1);
      expect(data).toEqual({});
      ws.disconnect();
      done()
    })
  })

  it('should broadcast asset location to interested connected client', async (done) => {
    jest.setTimeout(10000); // allow this test to take time

    ws.on('connected', async (data) => {
      console.log('client connected rightly');
      ws.emit('server:track:asset', { assetId: testAsset });
      console.log((await eventGateway.server.allSockets()).size);
      expect((await eventGateway.server.allSockets()).size).toEqual(1);
      expect(data).toEqual({});
    })

    ws.on('client:asset:tracking', async (data: any) => {
      console.log('asset tracked ', data.assetId);
      expect(data.assetId).toEqual(testAsset);
      expect(data.lastKnownLocation).toBeDefined();
      // expect(data).toStrictEqual(AssetSchema);
      ws.disconnect();
      setTimeout(() => {
        done();
      }, 5000);// differ closing of this test to avoid server close error
    });  
    
    
    try{
      const addAsset = await request(app.getHttpServer())
      .put(`/asset/${testAsset}/updateLocation`)
      .send({
        latitude: 6.508106, 
        longitude: 3.372387,
        address: 'Yaba, Lagos'
      })
      .set('Accept', 'application/json');

      expect(addAsset.statusCode).toBe(200);
      expect(addAsset.body.data.asset).toBeDefined();

    }catch(error){
      console.log(error);
    }
  })

  it('should not broadcast asset location to non-interested connected client', async (done) => {
    jest.setTimeout(20000); // allow this test to take time
    let timeout;

    ws.on('connected', async (data) => {
      console.log('client connected rightly');
      ws.emit('server:track:asset', { assetId: "Asset1" });
      console.log((await eventGateway.server.allSockets()).size);
      expect((await eventGateway.server.allSockets()).size).toEqual(1);
      expect(data).toEqual({});
      timeout = setTimeout(() => {
        ws.disconnect();
        done();
      }, 2000);
    })

    ws.on('client:asset:tracking', async (data: any) => {
      if(timeout) clearTimeout(timeout);
      console.log('asset tracked ', data.assetId);
      expect(data.assetId).toEqual(testAsset);
      expect(data.lastKnownLocation).toBeDefined();
      // expect(data).toStrictEqual(AssetSchema);
      ws.disconnect();
      setTimeout(() => {
        done.fail();
      }, 500);// differ closing of this test to avoid server close error
    });  
    
    
    try{
      const addAsset = await request(app.getHttpServer())
      .put(`/asset/${testAsset}/updateLocation`)
      .send({
        latitude: 6.508106, 
        longitude: 3.372387,
        address: 'Yaba, Lagos'
      })
      .set('Accept', 'application/json');

      expect(addAsset.statusCode).toBe(200);
      expect(addAsset.body.data.asset).toBeDefined();

    }catch(error){
      console.log(error);
    }
  })

  it.skip('should not receive proximity broadcast when asset is greater than 100m to connected client', async (done) => {
    jest.setTimeout(20000); // allow this test to take time
    let timeout;

    await new Promise(async (resolve, reject) => {
      ws.on('connected', async (data) => {
        console.log('client connected rightly');
        ws.emit('server:track:asset', { assetId: testAsset });
        console.log((await eventGateway.server.allSockets()).size);
        expect((await eventGateway.server.allSockets()).size).toEqual(1);
        expect(data).toEqual({});
      })
  
      ws.on('client:asset:tracking', async (data: any) => {
        console.log('asset tracked ', data.assetId);
        expect(data.assetId).toEqual(testAsset);
        expect(data.lastKnownLocation).toBeDefined();
        // expect(data).toStrictEqual(AssetSchema);
        ws.disconnect();
        timeout = setTimeout(() => {
          resolve(true);
          done();
        }, 3000);
      }); 
  
      ws.on('client:asset:proximity', async (data: any) => {
        if(timeout) clearTimeout(timeout); //clear timeout if this handle is called
        console.log('asset tracked ', data.assetId);
        expect(true).toBeFalsy();
        // expect(data).toStrictEqual(AssetSchema);
        setTimeout(() => {
          ws.disconnect();
          resolve(false);
          done.fail();
        }, 3000);// differ closing of this test to avoid server close error
      });  
      
      
      try{
        const addAsset = await request(app.getHttpServer())
        .put(`/asset/${testAsset}/updateLocation`)
        .send({
          latitude: 6.508106, 
          longitude: 3.372387,
          address: 'Yaba, Lagos'
        })
        .set('Accept', 'application/json');
  
        expect(addAsset.statusCode).toBe(200);
        expect(addAsset.body.data.asset).toBeDefined();
  
      }catch(error){
        console.log(error);
      }
    });
  })



    it.skip('should receive proximity broadcast when asset is at 0m to connected client', async (done) => {
      jest.setTimeout(50000); // allow this test to take time
      let timeout;
  
      // await new Promise( async (resolve, reject) => {
        ws.on('connected', async (data) => {
          console.log('client connected rightly');
          // ws.emit('server:track:asset', { assetId: testAsset });
          // console.log((await eventGateway.server.allSockets()).size);
          expect((await eventGateway.server.allSockets()).size).toEqual(1);
          expect(data).toEqual({});
        });
  
        // ws.on('client:asset:tracking', async (data: any) => {
          // console.log('asset tracked ', data.assetId);
          // expect(data.assetId).toEqual(testAsset);
          // expect(data.lastKnownLocation).toBeDefined();
          // expect(data).toStrictEqual(AssetSchema);
          // timeout = setTimeout(() => {
            // console.log('timeout');
            // resolve(true);
            // done.fail();
          // }, 30000);
        // }); 
    
        await ws.on('client:asset:proximity',  (data: any) => {
          console.log('asset tracked proximity ', data);
          if(timeout)clearTimeout(timeout);
          expect(data.assetId).toEqual(testAsset);
          expect(data.proxmity).toEqual(0);
          // expect(data).toStrictEqual(AssetSchema);
          
          // setTimeout(() => {
            // ws.disconnect();
            // resolve(true);
            done();
          // }, 20000);// differ closing of this test to avoid server close error
        }); 
        
        try{
          const addAsset = await request(app.getHttpServer())
          .put(`/asset/${testAsset}/updateLocation`)
          .send({
            latitude: 6.506523211836984,
            longitude: 3.3752939793162153,
            address: 'Yaba, Lagos'
          })
          .set('Accept', 'application/json');
    
          // expect(addAsset.statusCode).toBe(200);
          // expect(addAsset.body.data.asset).toBeDefined();
    
        }catch(error){
          console.log(error);
        }
      // })  
    })
  });
 
});
