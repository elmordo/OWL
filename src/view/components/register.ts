
import * as Buttons from "./button/register"
import * as TextLabel from "./text_label"
import * as Layout from "./layout/register"

import { ComponentFactory } from "../../component"
import { ServiceManager } from "../../service_management"


export function register(cm: ComponentFactory, sm: ServiceManager) : void {
    Buttons.registerButtons(cm, sm);
    TextLabel.register(cm, sm);
    Layout.register(cm, sm);
}
