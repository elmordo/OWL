
import { AbstractRenderer, RenderResult, EntryNodeLookup } from "../../../rendering"
import { DomManipulator, CommonHtmlNode, CommonHtmlText, CommonHtmlElement } from "../../../dom"
import { ControllerBase, ComponentFactory, registerFunctionFactory } from "../../../component"
import { ServiceManager, ServiceNamespace } from "../../../service_management"


export class Renderer extends AbstractRenderer {

    static TEMPLATE = "<div class='owl-list'></div>";
    static TEMPLATE_ORDERED = "<ol></ol>";
    static TEMPLATE_UNORDERED = "<ul></ul>";

    public render(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object) : RenderResult {
        let rootNode: CommonHtmlElement = manipulator.createNewFragment(Renderer.TEMPLATE);

        this._setupClassNames(rootNode, options);

        let entryNodes: EntryNodeLookup = new EntryNodeLookup();
        let innerContainer = this._renderInnerContainer(options["type"], manipulator);

        entryNodes["itemContainer"] = innerContainer;
        rootNode.append(innerContainer);
        this._copyContent(originalNode, innerContainer);

        return new RenderResult(rootNode, entryNodes);
    }

    public getOptions(node: CommonHtmlElement) : Object {
        let result = super.getOptions(node);
        result = this._getAttributeValue(node, "type", "unordered");
        return result;
    }

    protected _renderInnerContainer(listType: string, manipulator: DomManipulator) : CommonHtmlElement {
        let template: string;

        if (listType == "ordered")
            template = Renderer.TEMPLATE_ORDERED;
        else
            template = Renderer.TEMPLATE_UNORDERED;

        let inner: CommonHtmlElement = manipulator.createNewFragment(template);
        return inner;
    }
}


export class Controller extends ControllerBase {

    public setup(renderedContent: RenderResult, options: Object) {
        super.setup(renderedContent, options);
    }
}


export class ItemRenderer extends AbstractRenderer {

    static TEMPLATE = "<li class='owl-list-item'></li>";

    public render(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object) : RenderResult {
        let rootNode: CommonHtmlElement = manipulator.createNewFragment(ItemRenderer.TEMPLATE);

        this._setupClassNames(rootNode, options);
        this._copyContent(<CommonHtmlElement>originalNode, rootNode);
        let entryNodes: EntryNodeLookup = new EntryNodeLookup();

        return new RenderResult(rootNode, entryNodes);
    }

    public getOptions(node: CommonHtmlNode) : Object {
        let result = super.getOptions(node);
        return result;
    }
}


export class ItemController extends ControllerBase {

    public setup(renderedContent: RenderResult, options: Object) {
        super.setup(renderedContent, options);
    }
}


export let register = registerFunctionFactory("owl.component.list", "owlList", Renderer, Controller);
export let registerItem = registerFunctionFactory("owl.component.list_item", "owlListItem", ItemRenderer, ItemController);
