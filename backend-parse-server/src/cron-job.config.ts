import cron from "node-cron"
import { IpFilterUtil } from "./common/utils/ip-filter.utils"

export class CronJobConfigurator {

  static hasBeenConfigured = false

  static configure() {
    if (this.hasBeenConfigured) {
      return
    }
    // every 5th minute
    cron.schedule('*/5 * * * *', async () => {
      await IpFilterUtil.updateAllIpAddressesForHostnames()
      // await wait(20);
    })
    this.hasBeenConfigured = true
  }
}
