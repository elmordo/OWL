
import { AbstractRenderer, RenderResult, EntryNodeLookup } from "../../rendering"
import { DomManipulator, CommonHtmlNode, CommonHtmlText, CommonHtmlElement } from "../../dom"
import { ControllerBase, ComponentFactory, registerFunctionFactory } from "../../component"
import { ServiceManager, ServiceNamespace } from "../../service_management"

import * as Label from "./text_label"


export class Renderer extends Label.Renderer {

    static TEXTBOX_CONTAINER = "<div class='owl-textbox'><div class='owl-textbox-inner'></div></div>";

    public render(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object) : RenderResult {
        // get label
        let labelResult: RenderResult = super._render(originalNode, manipulator, options);

        // wrap label to container
        let outer: CommonHtmlElement, inner: CommonHtmlElement;
        [outer, inner] = this._renderWrapper(manipulator);
        this._setupClassNames(outer, options);

        inner.append(labelResult.rootNode);

        if (options["width"])
            outer.styles.set("width", options["width"]);

        let entryNodes: EntryNodeLookup = labelResult.entryNodes;
        let result: RenderResult = new RenderResult(outer, entryNodes);

        return result;
    }

    public getOptions(node: CommonHtmlNode) : Object {
        let result = super.getOptions(node);
        result["label"] = node.node.textContent;
        result["width"] = this._getAttributeValue(<CommonHtmlElement>node, "width", null);

        return result;
    }

    private _renderWrapper(manipulator: DomManipulator) : CommonHtmlElement[] {
        let wrapper: CommonHtmlElement = manipulator.createNewFragment(Renderer.TEXTBOX_CONTAINER);
        let inner: CommonHtmlElement = <CommonHtmlElement>wrapper.chidlren.getFirst();

        return [wrapper, inner];
    }
}


export class Controller extends Label.Controller {

}


export let register = registerFunctionFactory("owl.component.text_box", "owlTextBox", Renderer, Controller);
