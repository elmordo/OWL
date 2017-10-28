import { AbstractRenderer, IRenderer, RenderResult, EntryNodeLookup } from "../../../rendering"
import { CommonHtmlNode, CommonHtmlElement, DomManipulator, CommonNodeList } from "../../../dom"
import { ServiceManager } from "../../../service_management"
import { ComponentFactory, ComponentDescription, registerFunctionFactory, ControllerBase } from "../../../component"
import { BaseBoxController, BaseBoxRenderer, BaseBoxItemRenderer, BaseBoxItemController } from "./vh_base"


export class Renderer extends BaseBoxRenderer {

    protected _setupContainerClasses(root: CommonHtmlElement): void {
        root.styles.addClass("owl-vbox");
    }
}


export class Controller extends BaseBoxController {

}


export class BoxItemRenderer extends BaseBoxItemRenderer {

    protected _setupContainerClasses(root: CommonHtmlElement): void {
        root.styles.addClass("owl-vbox-item");
    }
}

export class BoxItemController extends BaseBoxItemController {

}


export let register: Function = registerFunctionFactory("owl.component.layout.vertical_box", "owlVerticalBox", Renderer, Controller);
export let registerItem: Function = registerFunctionFactory("owl.component.layout.vertical_box_item", "owlVerticalBoxItem", BoxItemRenderer, BoxItemController);
