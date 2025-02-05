import { Controller, Get, Param, Query } from "@nestjs/common";

import { DappDataService } from "./dapp-data.service";
import { DappData } from "./entities/dapp-data.entity";
import { DappDataRepo } from "./dapp-data.repo";

@Controller("dapp_data")
export class DappDataController {
  constructor(
    private dappDataService: DappDataService,
    private dappDataRepository: DappDataRepo,
  ) {}

  @Get(":id")
  public async getDappDataById(@Param("id") id: string): Promise<DappData> {
    return this.dappDataRepository.get(id);
  }

  @Get()
  public async getDappDataByNames(@Query("name") name: string | string[]): Promise<DappData | DappData[]> {
    return this.dappDataService.getDappDataByNames(name);
  }
}
