
import { ComponentFactory } from "../../../component";
import { ServiceManager } from "../../../service_management";
import * as Viewport from "./viewport"
import * as Slider from "./slider"
import * as VBox from "./vertical_box"


export function register(cf: ComponentFactory, sm: ServiceManager): void {
    Viewport.register(cf, sm);
    Slider.register(cf, sm);
    Slider.registerPage(cf, sm);
    VBox.register(cf, sm);
    VBox.registerItem(cf, sm);
}
