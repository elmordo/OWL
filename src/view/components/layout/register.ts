
import { ComponentFactory } from "../../../component";
import { ServiceManager } from "../../../service_management";
import * as Viewport from "./viewport"


export function register(cf: ComponentFactory, sm: ServiceManager): void {
    Viewport.register(cf, sm);
}
