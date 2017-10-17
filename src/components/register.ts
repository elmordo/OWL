
import * as Buttons from "./button/register"

import { ComponentManager } from "../component"
import { ServiceManager } from "../service_management"


export function register(cm: ComponentManager, sm: ServiceManager) : void {
    Buttons.registerButtons(cm, sm);
}
