import { AbstractRenderer, IRenderer, RenderResult, EntryNodeLookup } from "../../../rendering"
import { CommonHtmlNode, CommonHtmlElement, DomManipulator, CommonNodeList } from "../../../dom"
import { ServiceManager } from "../../../service_management"
import { ComponentFactory, ComponentDescription, registerFunctionFactory, ControllerBase } from "../../../component"
import { VisualComponentController, ContainerController, ContainerRenderer } from "../base"


export abstract class BaseBoxRenderer extends ContainerRenderer {

    static TEMPLATE: string = "<div class='owl-layout-fill-cross'></div>";

    public render(originalNode: CommonHtmlNode, manipulator: DomManipulator, options: Object) : RenderResult {
        let rootNode: CommonHtmlElement = manipulator.createNewFragment(BaseBoxRenderer.TEMPLATE);
        let entryNodes: EntryNodeLookup = new EntryNodeLookup();
        let originalElement = <CommonHtmlElement>originalNode;

        this._setupClassNames(rootNode, options);
        this._copyContent(<CommonHtmlElement>originalNode, rootNode);
        this._setupId(rootNode, options);

        let result: RenderResult = new RenderResult(rootNode, entryNodes);
        this._processRenderResult(result);

        this._setupLayout(options);

        return result;
    }

    /**
     * read options from the original node
     * @param {CommonHtmlNode} originalNode original node
     * @return {Object} parsed options
     */
    public getOptions(originalNode: CommonHtmlNode): Object {
        let result: Object = super.getOptions(originalNode);
        result["sizer"] = super._getAttributeValue(<CommonHtmlElement>originalNode, "sizer", "auto");

        this._setupContainerLayout(result);
        return result;
    }

    protected _getMainItemContainer() : CommonHtmlElement {
        return this._lastResult.rootElement;
    }

    protected abstract _setupContainerLayout(options: Object): void;
}


export class BaseBoxController extends ContainerController {

    protected _onTrackingReceived(evt: CustomEvent) : void {
        this.repaint();
    }

    protected _onTracked(evt: CustomEvent) : void {
        let senderController: ControllerBase = <ControllerBase>evt.detail;
        senderController.addEventListener(ControllerBase.EVENT_RESIZE, () => {
            console.log("prdel");
            this.repaint();
        });

        this.repaint();
    }
}


export abstract class BaseBoxItemRenderer extends AbstractRenderer {

    static TEMPLATE: string = "<div class='owl-box-item'></div>";

    public render(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object) : RenderResult {
        let root = manipulator.createNewFragment(BaseBoxItemRenderer.TEMPLATE);
        let entries = new EntryNodeLookup();
        let result: RenderResult = new RenderResult(root, entries);

        this._setupContainerClasses(root);
        this._copyContent(originalNode, root);
        this._setupId(root, options);
        this._setupClassNames(root, options);
        this._processRenderResult(result);

        return result;
    }

    public getOptions(originalNode: CommonHtmlElement) : Object {
        let options = super.getOptions(originalNode);
        options["size"] = this._getAttributeValue(originalNode, "size", "auto");
        console.log(options);
        return options;
    }

    protected abstract _setupContainerClasses(root: CommonHtmlElement): void;
}


export class BaseBoxItemController extends ControllerBase {

    protected _size: string;

    protected _oldSize: string;

    public setup(renderedContent: RenderResult, options: Object) : void {
        super.setup(renderedContent, options);

        this._size = options["size"];
    }

    public repaint() : void {
        super.repaint();

        if (this._oldSize != this._size) {
            this._updateSize();
        }
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

    protected _updateSize(): void {
        let oldClass: string = this._getClassBySize(this._oldSize);
        let newClass: string = this._getClassBySize(this._size);

        if (oldClass)
            this._view.rootElement.styles.removeClass(oldClass);

        if (newClass)
            this._view.rootElement.styles.addClass(newClass);

        this._oldSize = this._size;
    }

    protected _getClassBySize(sizeType: string): string {
        switch (sizeType) {
            case "content":
            return "owl-box-size-content";

            default:
            return null;
        }
    }

    get size(): string {
        return this._size;
    }
}
