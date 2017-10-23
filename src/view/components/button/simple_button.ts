
import { DomManipulator, CommonHtmlElement } from "../../../dom"
import { ComponentFactory, ComponentDescription } from "../../../component"
import { ServiceManager } from "../../../service_management"
import { ButtonRendererBase, ButtonController } from "./base"


export class Renderer extends ButtonRendererBase {

    static BUTTON_TEMPLATE = "<button type='button' class='owl-button'>button</button>";

    public getOptions(originalNode: CommonHtmlElement) : Object {
        let result = super.getOptions(originalNode);
        result["label"] = this._getAttributeValue(originalNode, "label", "button");

        return result;
    }

    protected _renderButton(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object) : CommonHtmlElement {
        let button = manipulator.createNewFragment(Renderer.BUTTON_TEMPLATE);
        return button;
    }
}


export class Controller extends ButtonController {
}


export function register(cm: ComponentFactory, sm: ServiceManager): void {
    let baseNs = "owl.component.button.simple";

    let rendererName: string = baseNs + ".renderer";
    let controllerName: string = baseNs + ".controller";

    sm.registerService(rendererName, () => { return new Renderer(); });
    sm.registerService(controllerName, () => { return new Controller(); });

    let dsc: ComponentDescription = new ComponentDescription("owlSimpleButton", rendererName, controllerName);
    cm.registerComponent(dsc);
}
