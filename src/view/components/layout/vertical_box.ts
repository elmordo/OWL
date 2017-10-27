import { AbstractRenderer, IRenderer, RenderResult, EntryNodeLookup } from "../../../rendering"
import { CommonHtmlNode, CommonHtmlElement, DomManipulator, CommonNodeList } from "../../../dom"
import { ServiceManager } from "../../../service_management"
import { ComponentFactory, ComponentDescription, SizeableComponent, registerFunctionFactory, ControllerBase } from "../../../component"


export class Renderer extends AbstractRenderer {

    static TEMPLATE: string = "<div class='owl-vbox'></div>";

    public render(originalNode: CommonHtmlNode, manipulator: DomManipulator, options: Object) : RenderResult {
        let rootNode: CommonHtmlElement = manipulator.createNewFragment(Renderer.TEMPLATE);
        let entryNodes: EntryNodeLookup = new EntryNodeLookup();
        let originalElement = <CommonHtmlElement>originalNode;

        this._setupClassNames(rootNode, options);
        this._copyContent(<CommonHtmlElement>originalNode, rootNode);

        let result: RenderResult = new RenderResult(rootNode, entryNodes);
        return result;
    }

    /**
     * read options from the original node
     * @param {CommonHtmlNode} originalNode original node
     * @return {Object} parsed options
     */
    public getOptions(originalNode: CommonHtmlNode): Object {
        let result: Object = super.getOptions(originalNode);
        result["sizer"] = super._getAttributeValue(<CommonHtmlElement>originalNode, "sizer");

        return result;
    }
}


export class Controller extends SizeableComponent {

    protected _onTrackingReceived(evt: CustomEvent) : void {
        this.repaint();
    }

    protected _onTracked(evt: CustomEvent) : void {
        let senderController: ControllerBase = <ControllerBase>evt.detail;
        senderController.addEventListener(ControllerBase.EVENT_RESIZE, () => {
            this.repaint();
        });

        this.repaint();
    }
}


export class BoxItemRenderer extends AbstractRenderer {

    static TEMPLATE: string = "<div class='owl-vbox-item'></div>";

    public render(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object) : RenderResult {
        let root = manipulator.createNewFragment(BoxItemRenderer.TEMPLATE);
        let entries = new EntryNodeLookup();
        let result: RenderResult = new RenderResult(root, entries);

        this._copyContent(originalNode, root);
        this._setupId(root, options);
        this._setupClassNames(root, options);

        return result;
    }

    public getOptions(originalNode: CommonHtmlElement) : Object {
        let options = super.getOptions(originalNode);
        options["size"] = this._getAttributeValue(originalNode, "size", "auto");

        return options;
    }
}


export class BoxItemController extends ControllerBase {

    protected _size: string;

    public setup(renderedContent: RenderResult, options: Object) : void {
        super.setup(renderedContent, options);

        this._size = options["size"];
    }

    public setRealSize(size: string) : void {
        this._view.rootElement.styles.set("height", size);
        this.repaint();
    }

    protected _onTracked(evt: CustomEvent) : void {
        let senderController: ControllerBase = <ControllerBase>evt.detail;
        senderController.addEventListener(ControllerBase.EVENT_RESIZE, () => {
            this.repaint();
        });

        this.repaint();
    }

    get size(): string {
        return this._size;
    }
}


export let register: Function = registerFunctionFactory("owl.component.layout.vertical_box", "owlVerticalBox", Renderer, Controller);
export let registerItem: Function = registerFunctionFactory("owl.component.layout.vertical_box_item", "owlVerticalBoxItem", BoxItemRenderer, BoxItemController);
