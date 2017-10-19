
import { ComponentFactory } from "../../component";
import { ServiceManager } from "../../service_management";
import * as ScreenBox from "./screen_box"


export function register(cf: ComponentFactory, sm: ServiceManager): void {
    ScreenBox.register(cf, sm);
}
