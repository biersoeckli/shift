import { lookup } from 'dns/promises';

export class IpFilterUtil {
    static validHostnames = new Map<string, string | undefined>();

    static setupHostnames(hostnames: string[]) {
        if (!hostnames) {
            return;
        }
        hostnames.forEach(hostname => this.validHostnames.set(hostname, undefined));
    }

    static async updateAllIpAddressesForHostnames() {
        try {
            console.log(`[IpFilterUtil] Updating ${this.validHostnames.size} hostnames...`);
            this.validHostnames = await this.getHostnameIpMap();
        } catch (ex) {
            console.error('[IpFilterUtil] Error while updating IP Addresses');
            console.error(ex);
        }
    }

    static async getValidIps() {
        let allValidIps: string[] = [];
        for (const val of this.validHostnames.values()) {
            allValidIps = allValidIps.concat(val ?? []);
        }
        return allValidIps;
    }

    static async getHostnameIpMap() {
        const result = new Map();
        for (const hostname of this.validHostnames.keys()) {
            const ipAdresses4Hostname: string[] = [];

            // IPv4
            try {
                const ipv4Adress = await lookup(hostname, 4);
                console.log(
                    `[IpFilterUtil] set ipv4Adress "${ipv4Adress.address}" for hostname "${hostname}".`
                );
                ipAdresses4Hostname.push(ipv4Adress.address);
            } catch (ex) {
                console.warn(
                    `[IpFilterUtil] error while trying to fetch ipv4Adress for hostname "${hostname}".`
                );
            }

            // IPv6
            try {
                const ipv6Adress = await lookup(hostname, 6);
                if (ipv6Adress.address && !ipv6Adress.address.startsWith('::ffff')) {
                    console.log(
                        `[IpFilterUtil] set ipv6Adress "${ipv6Adress.address}" for hostname "${hostname}".`
                    );
                    ipAdresses4Hostname.push(ipv6Adress.address);
                }
            } catch (ex) {
                console.warn(
                    `[IpFilterUtil] error while trying to fetch ipv6Adress for hostname "${hostname}".`
                );
            }

            result.set(hostname, ipAdresses4Hostname);
        }
        return result;
    }

    static async ipIsValid(forwardIp: string) {
        const allValidIps = await this.getValidIps();
        if (allValidIps.some((allowIp) => allowIp.includes(forwardIp))) {
            console.log(
                `[IpFilterUtil] access granted for: ${forwardIp}`
            );
            return true;
        } else {
            console.warn(
                `[IpFilterUtil] access denied for: ${forwardIp}`
            );
            return false;
        }
    }
}



