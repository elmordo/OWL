
import * as Buttons from "./button/register"
import * as Layout from "./layout/register"
import * as Container from "./container/register"

import * as TextLabel from "./text_label"
import * as TextBox from "./text_box"

import { ComponentFactory } from "../../component"
import { ServiceManager } from "../../service_management"


export function register(cm: ComponentFactory, sm: ServiceManager) : void {
    Buttons.registerButtons(cm, sm);
    TextLabel.register(cm, sm);
    Layout.register(cm, sm);
    TextBox.register(cm, sm);
    Container.register(cm, sm);
}
