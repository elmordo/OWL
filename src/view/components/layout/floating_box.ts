
import { AbstractRenderer, RenderResult, EntryNodeLookup } from "../../../rendering"
import { DomManipulator, CommonHtmlNode, CommonHtmlText, CommonHtmlElement } from "../../../dom"
import { ControllerBase, ComponentFactory, registerFunctionFactory } from "../../../component"
import { ServiceManager, ServiceNamespace } from "../../../service_management"


export class Renderer extends AbstractRenderer {

    static TEMPLATE = "<div class='owl-floating-box'></div>";

    public render(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object) : RenderResult {
        let rootNode: CommonHtmlElement = manipulator.createNewFragment(Renderer.TEMPLATE);

        this._setupClassNames(rootNode, options);
        this._copyContent(<CommonHtmlElement>originalNode, rootNode);
        let entryNodes: EntryNodeLookup = new EntryNodeLookup();

        let result: RenderResult = new RenderResult(rootNode, entryNodes);
        this._processRenderResult(result);

        return result;
    }

    public getOptions(node: CommonHtmlNode) : Object {
        let result = super.getOptions(node);

        result["verticalAlign"] = this._getAttributeValue(<CommonHtmlElement>node, "vertical-align", null);
        result["horizontalAlign"] = this._getAttributeValue(<CommonHtmlElement>node, "horizontal-align", null);
        result["left"] = this._getAttributeValue(<CommonHtmlElement>node, "left", null);
        result["right"] = this._getAttributeValue(<CommonHtmlElement>node, "right", null);
        result["top"] = this._getAttributeValue(<CommonHtmlElement>node, "top", null);
        result["bottom"] = this._getAttributeValue(<CommonHtmlElement>node, "bottom", null);

        return result;
    }
}


export class Controller extends ControllerBase {

    protected _verticalAlign: string;

    protected _horizontalAlign: string;

    protected _left: string;

    protected _right: string;

    protected _top: string;

    protected _bottom: string;

    public setup(renderedContent: RenderResult, options: Object) {
        super.setup(renderedContent, options);

        this._verticalAlign = options["verticalAlign"];
        this._horizontalAlign = options["horizontalAlign"];
        this._left = options["left"];
        this._right = options["right"];
        this._top = options["top"];
        this._bottom = options["bottom"];
    }

    public repaint() : void {
        if (!this.parent) return;

        this._resolveVerticalPosition();
        this._resolveHorizontalPosition();

        super.repaint();
    }

    protected _onTracked(evt: CustomEvent): void {
        this.repaint();
        this._bindResizeEventListener(evt.detail);
    }

    protected _onTrackingReceived(evt: CustomEvent): void {
        this.repaint();
        this._bindResizeEventListener(evt.detail);
    }

    protected _resolveVerticalPosition(): void {
        if (this._verticalAlign != null) {
            let position = this._getMiddlePositionInContainer("height");
            this._view.rootElement.styles.set("top", position.toString() + "px");
            console.log(position);
        } else if (this._top != null) {
            this._view.rootElement.styles.set("top", this._top);
        } else if (this._bottom != null)  {
            this._view.rootElement.styles.set("bottom", this._bottom);
        }
    }

    protected _resolveHorizontalPosition(): void {
        if (this._horizontalAlign != null) {
            let position = this._getMiddlePositionInContainer("width");
            console.log(position);
            this._view.rootElement.styles.set("left", position.toString() + "px");
        } else if (this._left != null) {
            this._view.rootElement.styles.set("left", this._left);
        } else if (this._right != null)  {
            this._view.rootElement.styles.set("right", this._right);
        }
    }

    protected _getMiddlePositionInContainer(direction: string): number {
        let containerSize = (<CommonHtmlElement>this.parent.view).size[direction];
        let contentSize = (<CommonHtmlElement>this.view).size[direction];

        return this._calculateMiddlePosition(containerSize, contentSize);
    }

    protected _calculateMiddlePosition(containerSize: number, contentSize: number): number {
        return (containerSize - contentSize) / 2
    }

    private _bindResizeEventListener(observedController: ControllerBase) : void {
        observedController.addEventListener(ControllerBase.EVENT_RESIZE, () => {
            this.repaint();
        });
    }
}


export let register = registerFunctionFactory("owl.component.foating_box", "owlFloatingBox", Renderer, Controller);
