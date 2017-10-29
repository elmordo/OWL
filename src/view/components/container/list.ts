
import { AbstractRenderer, RenderResult, EntryNodeLookup } from "../../../rendering"
import { DomManipulator, CommonHtmlNode, CommonHtmlText, CommonHtmlElement } from "../../../dom"
import { ControllerBase, ComponentFactory, registerFunctionFactory } from "../../../component"
import { ServiceManager, ServiceNamespace } from "../../../service_management"


export class Renderer extends AbstractRenderer {

    static TEMPLATE = "<div class='owl-list'></div>";
    static TEMPLATE_ORDERED = "<ol></ol>";
    static TEMPLATE_UNORDERED = "<ul></ul>";
    static TEMPLATE_SIMPLE = "<ul class='owl-list-simple'></ul>";

    public render(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object) : RenderResult {
        let rootNode: CommonHtmlElement = manipulator.createNewFragment(Renderer.TEMPLATE);

        this._setupClassNames(rootNode, options);
        this._setupId(rootNode, options);

        let entryNodes: EntryNodeLookup = new EntryNodeLookup();
        let innerContainer = this._renderInnerContainer(options["type"], manipulator);
        this._copyContent(originalNode, innerContainer);

        entryNodes["itemContainer"] = innerContainer;
        rootNode.append(innerContainer);

        let result: RenderResult = new RenderResult(rootNode, entryNodes);
        this._processRenderResult(result);

        return result;
    }

    public getOptions(node: CommonHtmlElement) : Object {
        let result = super.getOptions(node);
        result["type"] = this._getAttributeValue(node, "type", "simple");
        return result;
    }

    protected _renderInnerContainer(listType: string, manipulator: DomManipulator) : CommonHtmlElement {
        let template: string;

        switch (listType) {
            case "ordered":
            template = Renderer.TEMPLATE_ORDERED;
            break;

            case "unordered":
            template = Renderer.TEMPLATE_UNORDERED;
            break;

            default:
            template = Renderer.TEMPLATE_SIMPLE;
            break;
        }

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
