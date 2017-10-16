
import * as SB from "./simple_button"

import { ComponentManager } from "../../component"
import { ServiceManager } from "../../service_management"


export function registerButtons(cm: ComponentManager, sm: ServiceManager) : void {
    SB.register(cm, sm);
}
