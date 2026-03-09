import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MathController } from './math/math.controller';
import { MathService } from './math/math.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemsModule } from './items/items.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [ TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'nest_training',
      entities: [__dirname + '/**/*.entity{.ts,.js}'], // Automatically find all entity files
      synchronize: true, // <--- MAGIC SETTING: Automatically creates tables on startup!
    }),UsersModule, ItemsModule, AuthModule,],
  controllers: [AppController, MathController],
  providers: [AppService, MathService],
})
export class AppModule {}
