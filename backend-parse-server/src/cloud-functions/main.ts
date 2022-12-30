
import { Container } from "typedi";
import { BaseCloudFunction } from "./cloud-function.interface";
import { CLOUD_FUNCTION_CLASSES } from "./cloud-functions.conf";


// initializing cloud functions 
for (const cloudFunc of CLOUD_FUNCTION_CLASSES) {
    const funcInstance = Container.get(cloudFunc as any);
    (funcInstance as any).init();
}

