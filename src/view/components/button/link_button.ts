
import { DomManipulator, CommonHtmlElement, CommonHtmlAttribute } from "../../../dom"
import { registerFunctionFactory } from "../../../component"
import { ButtonRendererBase, ButtonController } from "./base"
import { EntryNodeLookup } from "../../../rendering"


export class Renderer extends ButtonRendererBase {

    static BUTTON_TEMPLATE = "<a class='owl-button'>button</a>";

    public getOptions(originalNode: CommonHtmlElement) : Object {
        let result = super.getOptions(originalNode);
        result["label"] = this._getAttributeValue(originalNode, "label", "button");
        result["href"] = this._getAttributeValue(originalNode, "href", "");

        return result;
    }

    protected _setupLookup(button: CommonHtmlElement, wrapperLookup: EntryNodeLookup) : void {
        super._setupLookup(button, wrapperLookup);
        wrapperLookup["href"] = button.attributes.get("href");
    }

    protected _renderButton(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object) : CommonHtmlElement {
        let button = manipulator.createNewFragment(Renderer.BUTTON_TEMPLATE);
        button.attributes.set("href", options["href"]);
        return button;
    }
}


export class Controller extends ButtonController {

    get href(): string {
        return (<CommonHtmlAttribute>this._view.getEntry("href")).value;
    }
}


export let register: Function = registerFunctionFactory("owl.component.button.link", "owlLinkButton", Renderer, Controller);
