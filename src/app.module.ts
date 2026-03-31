import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsModule } from './items/items.module';
import { AuthModule } from './auth/auth.module';
import { WarehouseModule } from './warehouse/warehouse.module';
import { PrismaModule } from './prisma.module';
import { WarehouseItemModule } from './warehouse-item/warehouse-item.module';
import { ThrottlerModule } from '@nestjs/throttler';
@Module({
  imports: [ 
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'nest_training',
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Automatically find all entity files
      synchronize: true, // <--- MAGIC SETTING: Automatically creates tables on startup!
    }),

    ThrottlerModule.forRoot([  
      {
        name: 'auth',
        ttl: 60000,             // 60 seconds
        limit: 20,              // max 20 requests per IP per window
      },
    ]),

    UsersModule,
    ItemsModule,
    AuthModule,
    WarehouseModule,
    PrismaModule,
    WarehouseItemModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
