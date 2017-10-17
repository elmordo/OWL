
import * as Buttons from "./button/register"

import { ComponentFactory } from "../component"
import { ServiceManager } from "../service_management"


export function register(cm: ComponentFactory, sm: ServiceManager) : void {
    Buttons.registerButtons(cm, sm);
}
