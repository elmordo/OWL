
import * as SB from "./simple_button"
import * as LB from "./link_button"

import { ComponentFactory } from "../../../component"
import { ServiceManager } from "../../../service_management"


export function registerButtons(cm: ComponentFactory, sm: ServiceManager) : void {
    SB.register(cm, sm);
    LB.register(cm, sm);
}
