import * as List from "./list"
import * as ContentSwitch from "./content_switch"

import { ComponentFactory } from "../../../component"
import { ServiceManager } from "../../../service_management"


export function register(cm: ComponentFactory, sm: ServiceManager) : void {
    List.register(cm, sm);
    List.registerItem(cm, sm);
    ContentSwitch.register(cm, sm);
    ContentSwitch.registerItem(cm, sm);
}
