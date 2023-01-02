import cron from "node-cron"
import Container from "typedi"
import { IpFilterUtil } from "../common/utils/ip-filter.utils"
import { ApplicationUpdateJob } from "./application-update.job"

export class CronJobConfigurator {

  static hasBeenConfigured = false

  static configure() {
    if (this.hasBeenConfigured) {
      return
    }
    // every 5th minute
    cron.schedule('*/5 * * * *', async () => {
      await IpFilterUtil.updateAllIpAddressesForHostnames();
      // await wait(20);
      await Container.get(ApplicationUpdateJob).run();
    })
    this.hasBeenConfigured = true
  }
}
