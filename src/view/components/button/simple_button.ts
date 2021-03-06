
import { DomManipulator, CommonHtmlElement } from "../../../dom"
import { registerFunctionFactory } from "../../../component"
import { EntryNodeLookup } from "../../../rendering"
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

    protected _setupLookup(button: CommonHtmlElement, wrapperLookup: EntryNodeLookup) : void {
        super._setupLookup(button, wrapperLookup);
        wrapperLookup["href"] = button.attributes.get("href");
    }
}


export class Controller extends ButtonController {
}


export let register: Function = registerFunctionFactory("owl.component.button.simple", "owlSimpleButton", Renderer, Controller);
