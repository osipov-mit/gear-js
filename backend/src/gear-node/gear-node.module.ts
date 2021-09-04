import { Module } from '@nestjs/common';
import { MessagesModule } from 'src/messages/messages.module';
import { ProgramsModule } from 'src/programs/programs.module';
import { UsersModule } from 'src/users/users.module';
import { GearNodeEvents } from './events';
import { GearNodeService } from './gear-node.service';
import { CreateType } from './custom-types';

@Module({
  imports: [UsersModule, ProgramsModule, MessagesModule],
  providers: [GearNodeService, GearNodeEvents, CreateType],
  exports: [GearNodeService],
})
export class GearNodeModule {}