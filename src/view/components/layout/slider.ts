import { AbstractRenderer, IRenderer, RenderResult, EntryNodeLookup } from "../../../rendering"
import { CommonHtmlNode, CommonHtmlElement, DomManipulator, CommonNodeList } from "../../../dom"
import { ServiceManager } from "../../../service_management"
import { ComponentFactory, ComponentDescription, registerFunctionFactory, ControllerBase } from "../../../component"
import { SizeableComponent } from "../base"


export class Renderer extends AbstractRenderer {

    static TEMPLATE: string = "<div class='owl-slider'></div>";

    public render(originalNode: CommonHtmlNode, manipulator: DomManipulator, options: Object) : RenderResult {
        let rootNode: CommonHtmlElement = manipulator.createNewFragment(Renderer.TEMPLATE);
        let entryNodes: EntryNodeLookup = new EntryNodeLookup();
        let originalElement = <CommonHtmlElement>originalNode;

        this._copyContent(originalElement, rootNode);
        this._setupClassNames(rootNode, options);

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
        result["duration"] = super._getAttributeValue(<CommonHtmlElement>originalNode, "slide-duration");

        return result;
    }
}


export class Controller extends SizeableComponent {

    private _duration: number;

    public goto(pageName: string) : void {
        let container: CommonHtmlElement = this._getItemContainer();
        let targetItem: CommonHtmlElement = this._findItemByName(pageName);
        let targetScroll = this._getTargetPosition(targetItem);

        this._scroll(container, targetScroll);
    }

    public setup(renderedContent: RenderResult, options: Object) : void {
        super.setup(renderedContent, options);
        this._duration = Number(options["duration"])
    }

    get duration(): number {
        return this._duration;
    }

    set duration(val: number) {
        this._duration = val;
    }

    protected _onTracked(evt: CustomEvent) : void {
        let senderController: ControllerBase = <ControllerBase>evt.detail;
        senderController.addEventListener(ControllerBase.EVENT_RESIZE, () => {
            this.repaint();
        });

        this.repaint();
    }

    private _getItemContainer() : CommonHtmlElement {
        return <CommonHtmlElement>this._view.rootNode;
    }

    private _getCurrentScroll(itemContainer: CommonHtmlElement) : number {
        return itemContainer.element.scrollTop;
    }

    private _getTargetPosition(target: CommonHtmlElement) : number {
        return target.element.offsetTop;
    }

    private _scroll(container: CommonHtmlElement, targetValue: number) : void {
        if (this._duration == 0) {
            container.element.scrollTo(0, targetValue);
        } else {
            this._slideSmooth(container, targetValue);
        }
    }

    private _slideSmooth(container: CommonHtmlElement, target: number) : void {
        let timeLeft: number = this._duration;
        let timeStep: number = 1000 / 60;
        let timeSteps: number = this._duration / timeStep;

        let startScroll: number = container.element.scrollTop;
        let currentPosition = startScroll;
        let scrollLength: number =  target - startScroll;
        let scrollStep = scrollLength / timeSteps;

        let iteration = 0;

        let tm: number = setInterval(() => {
            let delta = Math.abs(currentPosition - target);

            if (delta < Math.abs(scrollStep) || delta == 0) {
                container.element.scrollTo(0, target);
                clearInterval(tm);
                return;
            }

            ++iteration;
            currentPosition = startScroll + scrollStep * iteration;
            container.element.scrollTo(0, currentPosition);

            if (currentPosition < 0) clearInterval(tm);
        }, timeStep);
    }

    private _findItemByName(name: string) : CommonHtmlElement {
        let result: CommonHtmlElement = null;

        for (let child of this.children) {
            let typedChild: SliderPageController = <SliderPageController>child;

            if (typedChild.pageName == name) {
                result = <CommonHtmlElement>typedChild.view;
            }
        }

        if (result === null)
            throw new Error("Page '" + name + "' not found");

        return result;
    }
}


export class SliderPageRenderer extends AbstractRenderer {

    static TEMPLATE: string = "<div class='owl-slider-page'></div>";

    public render(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object) : RenderResult {
        let root = manipulator.createNewFragment(SliderPageRenderer.TEMPLATE);
        let entries = new EntryNodeLookup();
        let result: RenderResult = new RenderResult(root, entries);

        this._copyContent(originalNode, root);

        return result;
    }

    public getOptions(rootNode: CommonHtmlElement) : Object {
        let result = super.getOptions(rootNode);
        result["name"] = this._getAttributeValue(rootNode, "name", null);

        return result;
    }
}


export class SliderPageController extends ControllerBase {

    private _pageName: string;

    public setup(renderedContent: RenderResult, options: Object) : void {
        super.setup(renderedContent, options);
        this._pageName = options["name"];
    }

    protected _onTracked(evt: CustomEvent) : void {
        let controller: ControllerBase = <ControllerBase>evt.detail;
        controller.addEventListener(ControllerBase.EVENT_RESIZE, (evt) => { this.repaint(); });
    }

    get pageName(): string {
        return this._pageName;
    }

    set pageName(val: string) {
        this._pageName = val;
    }
}


export let register: Function = registerFunctionFactory("owl.component.layout.slider", "owlSlider", Renderer, Controller);
export let registerPage: Function = registerFunctionFactory("owl.component.layout.slider_page", "owlSliderPage", SliderPageRenderer, SliderPageController);
