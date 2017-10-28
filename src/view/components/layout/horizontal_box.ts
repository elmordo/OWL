import { AbstractRenderer, IRenderer, RenderResult, EntryNodeLookup } from "../../../rendering"
import { CommonHtmlNode, CommonHtmlElement, DomManipulator, CommonNodeList } from "../../../dom"
import { ServiceManager } from "../../../service_management"
import { ComponentFactory, ComponentDescription, registerFunctionFactory, ControllerBase } from "../../../component"
import { BaseBoxController, BaseBoxRenderer, BaseBoxItemRenderer, BaseBoxItemController } from "./vh_base"


export class Renderer extends BaseBoxRenderer {

    protected _setupContainerClasses(root: CommonHtmlElement): void {
        root.styles.addClass("owl-hbox");
    }
}


export class Controller extends BaseBoxController {

}


export class BoxItemRenderer extends BaseBoxItemRenderer {

    protected _setupContainerClasses(root: CommonHtmlElement): void {
        root.styles.addClass("owl-hbox-item");
    }
}

export class BoxItemController extends BaseBoxItemController {

}


export let register: Function = registerFunctionFactory("owl.component.layout.horizontal_box", "owlHorizontalBox", Renderer, Controller);
export let registerItem: Function = registerFunctionFactory("owl.component.layout.horizontal_box_item", "owlHorizontalBoxItem", BoxItemRenderer, BoxItemController);
