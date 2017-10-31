
import { AbstractRenderer, RenderResult, EntryNodeLookup } from "../../../rendering"
import { DomManipulator, CommonHtmlNode, CommonHtmlText, CommonHtmlElement } from "../../../dom"
import { ControllerBase, ComponentFactory, registerFunctionFactory } from "../../../component"
import { SizeableController } from "../base"
import { ServiceManager, ServiceNamespace } from "../../../service_management"


export class Renderer extends AbstractRenderer {

    static TEMPLATE = "<div class='owl-content-switch'></div>";

    public render(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object) : RenderResult {
        let rootNode: CommonHtmlElement = manipulator.createNewFragment(Renderer.TEMPLATE);

        this._setupClassNames(rootNode, options);
        this._setupId(rootNode, options);
        this._copyContent(<CommonHtmlElement>originalNode, rootNode);
        let entryNodes: EntryNodeLookup = new EntryNodeLookup();

        return new RenderResult(rootNode, entryNodes);
    }

    public getOptions(node: CommonHtmlNode) : Object {
        let result = super.getOptions(node);
        return result;
    }
}


export class Controller extends SizeableController {

    protected _items: ItemController[];

    protected _activeItem: ItemController = null;

    protected _activeIndex: number = -1;

    public setActiveIndex(index: number) : void {
        let item = this._items[index];

        if (!item)
            throw new Error("Item index '" + index + "' was not found.");

        if (this._activeItem)
            this._activeItem.hide();

        item.show();
        this._activeItem = item;
    }

    public setActiveName(name: string) : void {
        for (let i in this._items) {
            if (this._items[i].name == name) {
                this.setActiveIndex(Number(i));
                return;
            }
        }
        throw new Error("Item name '" + name + "' not found.");
    }

    public setup(renderedContent: RenderResult, options: Object) {
        this._items = new Array<ItemController>();
        super.setup(renderedContent, options);
    }

    protected _onTrackingReceived(evt: CustomEvent) : void {
        let controller = <ControllerBase>evt.detail;

        if (controller instanceof ItemController) {
            this._items.push(controller);
            controller.hide();

            var newItemIndex = this._items.length - 1;

            if (this._activeIndex == -1)
                this._activeIndex = newItemIndex;

            if (this._activeIndex == newItemIndex)
                this.setActiveIndex(newItemIndex);
        }
    }
}


export class ItemRenderer extends AbstractRenderer {

    static TEMPLATE = "<div class='owl-content-switch-item'></div>";

    public render(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object) : RenderResult {
        let rootNode: CommonHtmlElement = manipulator.createNewFragment(Renderer.TEMPLATE);

        this._setupClassNames(rootNode, options);
        this._setupId(rootNode, options);
        this._copyContent(<CommonHtmlElement>originalNode, rootNode);
        let entryNodes: EntryNodeLookup = new EntryNodeLookup();

        return new RenderResult(rootNode, entryNodes);
    }

    public getOptions(node: CommonHtmlNode) : Object {
        let result = super.getOptions(node);
        return result;
    }
}


export class ItemController extends SizeableController {

    protected _name: string;

    public setup(renderedContent: RenderResult, options: Object) {
        super.setup(renderedContent, options);
        this._name = options["name"] || null;
    }

    public hide() : void {
        this._view.rootElement.styles.addClass("owl-hidden");
    }

    public show() : void {
        this._view.rootElement.styles.removeClass("owl-hidden");
    }

    get name(): string {
        return this._name;
    }
}


export let register = registerFunctionFactory("owl.component.content_switch", "owlContentSwitch", Renderer, Controller);
export let registerItem = registerFunctionFactory("owl.component.content_switch_item", "owlContentSwitchItem", ItemRenderer, ItemController);
