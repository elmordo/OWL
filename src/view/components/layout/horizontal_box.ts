import { AbstractRenderer, IRenderer, RenderResult, EntryNodeLookup } from "../../../rendering"
import { CommonHtmlNode, CommonHtmlElement, DomManipulator, CommonNodeList } from "../../../dom"
import { ServiceManager } from "../../../service_management"
import { ComponentFactory, ComponentDescription, SizeableComponent, registerFunctionFactory, ControllerBase } from "../../../component"


export class Renderer extends AbstractRenderer {

    static TEMPLATE: string = "<div class='owl-hbox'></div>";

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

    public repaint() : void {
        super.repaint();
        let rootElement: CommonHtmlElement = <CommonHtmlElement>this._view.rootNode;
        let byContent: ControllerBase[], byAuto: ControllerBase[], byExplicit: ControllerBase[];
        [byContent, byAuto, byExplicit] = this._categorizeChildren(this.children);

        let availableSpace: number = this._getAvailableSize();

        this._processExplicits(byExplicit);

        availableSpace -= this._getTotalHeight(byExplicit);
        availableSpace -= this._getTotalHeight(byContent);

        this._processAutos(byAuto, availableSpace);
        this._dispatchLocalEvent(ControllerBase.EVENT_RESIZE);
    }

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

    private _categorizeChildren(children: ControllerBase[]) : ControllerBase[][] {
        let byContent: ControllerBase[] = new Array<ControllerBase>();
        let byAuto: ControllerBase[] = new Array<ControllerBase>();
        let byExplicit: ControllerBase[] = new Array<ControllerBase>();

        children.forEach((c: ControllerBase) => {
            if (c.type == "owlHorizontalBoxItem") {
                let bic: BoxItemController = <BoxItemController>c;
                switch(bic.size) {
                    case "auto":
                    byAuto.push(c);
                    break;

                    case "content":
                    byContent.push(c);
                    break;

                    default:
                    byExplicit.push(c);
                    break;
                }
            }
        });

        return [byContent, byAuto, byExplicit];
    }

    private _processExplicits(controllers: ControllerBase[]) : void {
        controllers.forEach((c) => {
            let bic: BoxItemController = <BoxItemController>c;
            let height = bic.size + "px";
            bic.setRealSize(height);
        });
    }

    private _processAutos(controllers: ControllerBase[], availableSpace: number) : void {
        if (controllers.length > 0) {
            let perElement: number = availableSpace / controllers.length;
            let perElementPx: string = perElement.toString() + "px";

            controllers.forEach((c) => {
                let bic: BoxItemController = <BoxItemController>c;
                bic.setRealSize(perElementPx);
            });
        }
    }

    private _getItemElements() : CommonNodeList {
        let container: CommonHtmlElement = this._getItemContainer();
        return container.chidlren;
    }

    private _getItemContainer() : CommonHtmlElement {
        return <CommonHtmlElement>this._view.rootNode;
    }

    private _getAvailableSize() : number {
        return this._getItemContainer().size.height;
    }

    private _getTotalHeight(controllers: ControllerBase[]) : number {
        let result: number = 0;

        controllers.forEach((c) => {
            result += (<CommonHtmlElement>c.view).size.height;
        });

        return result;
    }
}


export class BoxItemRenderer extends AbstractRenderer {

    static TEMPLATE: string = "<div class='owl-hbox-item'></div>";

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


export let register: Function = registerFunctionFactory("owl.component.layout.horizontal_box", "owlHorizontalBox", Renderer, Controller);
export let registerItem: Function = registerFunctionFactory("owl.component.layout.horizontal_box_item", "owlHorizontalBoxItem", BoxItemRenderer, BoxItemController);
