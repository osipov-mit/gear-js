import { Injectable, Logger } from '@nestjs/common';
import { CodeChangedData, MessageEnqueuedData } from '@gear-js/api';
import { filterEvents } from '@polkadot/api/util';
import { GenericEventData } from '@polkadot/types';
import { Keys } from '@gear-js/common';
import { plainToClass } from 'class-transformer';

import { gearService } from './gear-service';
import { ProgramService } from '../program/program.service';
import { MessageService } from '../message/message.service';
import { CodeService } from '../code/code.service';
import { getPayloadByGearEvent, getUpdateMessageData } from '../common/helpers';
import { HandleExtrinsicsDataInput } from './types';
import { Message } from '../database/entities';
import { CodeStatus, MessageEntryPoing, MessageType, ProgramStatus } from '../common/enums';
import { CodeRepo } from '../code/code.repo';
import { UpdateCodeInput } from '../code/types';
import { changeStatus } from '../healthcheck/healthcheck.controller';
import { ProgramRepo } from '../program/program.repo';

@Injectable()
export class GearEventListener {
  private logger: Logger = new Logger('GearEventListener');

  constructor(
    private programService: ProgramService,
    private programRepository: ProgramRepo,
    private messageService: MessageService,
    private codeService: CodeService,
    private codeRepository: CodeRepo,
  ) {}

  public async listen() {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const unsub = await this.listener();

      return new Promise((resolve) => {
        gearService.getApi().on('error', (error) => {
          unsub();
          changeStatus('gearWSProvider');
          resolve(error);
        });
      });
    }
  }

  private async listener() {
    const gearApi = gearService.getApi();
    const genesis = gearApi.genesisHash.toHex();

    return gearApi.query.system.events(async (events) => {
      const blockHash = events.createdAtHash!.toHex();

      const [blockTimestamp, block, extrinsicStatus] = await Promise.all([
        gearApi.blocks.getBlockTimestamp(blockHash),
        gearApi.blocks.get(blockHash),
        gearApi.createType('ExtrinsicStatus', { finalized: blockHash }),
      ]);

      const base = {
        genesis,
        blockHash,
        timestamp: blockTimestamp.toNumber(),
      };

      await this.handleExtrinsics({
        genesis,
        events,
        status: extrinsicStatus,
        signedBlock: block,
        timestamp: blockTimestamp.toNumber(),
        blockHash,
      });

      for (const {
        event: { data, method },
      } of events) {
        try {
          const payload = getPayloadByGearEvent(method, data as GenericEventData);
          if (payload !== null && payload !== undefined) {
            await this.handleEvents(method, { ...payload, ...base });
          }
        } catch (error) {
          console.error(error);
          this.logger.warn({ method, data: data.toHuman() });
          this.logger.error('--------------END_ERROR--------------');
        }
      }
    });
  }

  private async handleEvents(method: string, payload: any): Promise<void> {
    const { id, genesis, timestamp } = payload;

    const eventsMethod = {
      [Keys.UserMessageSent]: async () => {
        const createMessageDBType = plainToClass(Message, {
          ...payload,
          timestamp: new Date(timestamp),
          type: MessageType.USER_MESS_SENT,
        });
        await this.messageService.createMessages([createMessageDBType]);
      },
      [Keys.ProgramChanged]: async () => {
        if (payload.isActive) await this.programService.setStatus(id, genesis, ProgramStatus.ACTIVE);
      },
      [Keys.MessagesDispatched]: async () => {
        await this.messageService.setDispatchedStatus(payload);
      },
      [Keys.UserMessageRead]: async () => {
        await this.messageService.updateReadStatus(id, payload.reason);
      },
      [Keys.DatabaseWiped]: async () => {
        await Promise.all([
          this.messageService.deleteRecords(genesis),
          this.programService.deleteRecords(genesis),
          this.codeService.deleteRecords(genesis),
        ]);
      },
    };

    try {
      method in eventsMethod && (await eventsMethod[method]());
    } catch (error) {
      console.log(error);
      this.logger.error(error);
    }
  }

  private async handleExtrinsics(handleExtrinsicsData: HandleExtrinsicsDataInput): Promise<void> {
    const { signedBlock, events, status, genesis, timestamp, blockHash } = handleExtrinsicsData;

    await this.findAndCreateCodes(handleExtrinsicsData);
    await this.findAndCreatePrograms(handleExtrinsicsData);

    const txMethods = ['sendMessage', 'uploadProgram', 'createProgram', 'sendReply'];
    for (const {
      hash,
      args,
      method: { method },
    } of signedBlock.block.extrinsics.filter(({ method: { method } }) => txMethods.includes(method))) {
      let createMessagesDBType = [];

      const filteredEvents = filterEvents(hash, signedBlock, events, status).events!.find(
        ({ event: { method } }) => method === Keys.MessageEnqueued,
      );

      const eventData = filteredEvents.event.data as MessageEnqueuedData;

      const [payload, value] = getUpdateMessageData(args, method);

      const messageDBType = plainToClass(Message, {
        id: eventData.id.toHex(),
        destination: eventData.destination.toHex(),
        source: eventData.source.toHex(),
        entry: eventData.entry.isInit
          ? MessageEntryPoing.INIT
          : eventData.entry.isHandle
            ? MessageEntryPoing.HANDLE
            : MessageEntryPoing.REPLY,
        payload,
        value,
        timestamp: new Date(timestamp),
        genesis,
        program: await this.programRepository.get(eventData.destination.toHex()),
      });

      createMessagesDBType = [...createMessagesDBType, messageDBType];

      try {
        if (createMessagesDBType.length >= 1) await this.messageService.createMessages(createMessagesDBType);
      } catch (error) {
        this.logger.error(error);
      }
    }
  }

  private async findAndCreatePrograms(handleExtrinsicsData: HandleExtrinsicsDataInput) {
    const { signedBlock, events, status, genesis, timestamp, blockHash } = handleExtrinsicsData;

    const extrinsics = signedBlock.block.extrinsics.filter(({ method: { method } }) =>
      ['uploadProgram', 'createProgram'].includes(method),
    );

    for (const extrinsic of extrinsics) {
      const filteredEvents = filterEvents(extrinsic.hash, signedBlock, events, status).events!.find(
        ({ event: { method } }) => method === Keys.MessageEnqueued,
      );
      if (!filteredEvents) {
        continue;
      }

      const { source, destination } = filteredEvents.event.data as MessageEnqueuedData;

      const codeId = await gearService.getApi().program.codeHash(destination.toHex());
      const code = await this.codeRepository.get(codeId);

      return this.programService.createProgram({
        id: destination.toHex(),
        owner: source.toHex(),
        genesis,
        timestamp,
        blockHash,
        code,
      });
    }
  }

  private async findAndCreateCodes(handleExtrinsicsData: HandleExtrinsicsDataInput): Promise<void> {
    const { signedBlock, events, status, genesis, timestamp, blockHash } = handleExtrinsicsData;

    const extrinsics = signedBlock.block.extrinsics.filter(({ method: { method } }) =>
      ['uploadCode', 'uploadProgram'].includes(method),
    );

    for (const extrinsic of extrinsics) {
      const filteredEvents = filterEvents(extrinsic.hash, signedBlock, events, status).events!.find(
        ({ event: { method } }) => method === Keys.CodeChanged,
      );
      if (!filteredEvents) {
        continue;
      }

      const { change, id } = filteredEvents.event.data as CodeChangedData;

      const updateCodeInput: UpdateCodeInput = {
        id: id.toHex(),
        genesis,
        status: change.isActive ? CodeStatus.ACTIVE : change.isInactive ? CodeStatus.INACTIVE : null,
        timestamp,
        blockHash,
        expiration: change.isActive ? (change.asActive.expiration.toHuman() as number) : null,
      };

      await this.codeService.updateCode(updateCodeInput);
    }
  }
}