import { AbstractRenderer, IRenderer, RenderResult, EntryNodeLookup } from "../../../rendering"
import { CommonHtmlNode, CommonHtmlElement, DomManipulator, CommonNodeList } from "../../../dom"
import { ServiceManager } from "../../../service_management"
import { ComponentFactory, ComponentDescription, SizeableComponent, registerFunctionFactory } from "../../../component"


export class Renderer extends AbstractRenderer {

    static TEMPLATE: string = "<div class='owl-slider'></div>";

    static WRAPPER_TEMPLATE: string = "<div class='owl-slider-page'></div>";

    public render(originalNode: CommonHtmlNode, manipulator: DomManipulator, options: Object) : RenderResult {
        let rootNode: CommonHtmlElement = manipulator.createNewFragment(Renderer.TEMPLATE);
        let entryNodes: EntryNodeLookup = new EntryNodeLookup();
        let originalElement = <CommonHtmlElement>originalNode;

        while (originalElement.element.children.length) {
            let page: Element = originalElement.element.children.item(0);

            if (page.tagName != "OWL:OWL-SLIDER-PAGE")
                throw new Error("Slider's children could be only 'owl:owl-slider-page', but '" + page.tagName + "' found.");

            page.parentElement.removeChild(page);
            this._addPage(rootNode, page, -1, manipulator);
        }

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

    public addItem(target: CommonHtmlElement, content: Node, index: number, manipulator: DomManipulator) {
        let wrappedContent: CommonHtmlElement = this._wrapItem(content, manipulator);
        this._addPageToTarget(target, wrappedContent, index);
    }

    protected _addPage(target: CommonHtmlElement, page: Element, index:number, domManipulator: DomManipulator) : void {
        let containerElement: CommonHtmlElement = domManipulator.createNewFragment(Renderer.WRAPPER_TEMPLATE);
        containerElement.attributes.set("name", page.getAttribute("name"));

        while (page.childNodes.length)
            containerElement.element.appendChild(page.childNodes.item(0));

        this._addPageToTarget(target, containerElement, index);
    }

    private _addPageToTarget(target: CommonHtmlElement, pageContainer: CommonHtmlElement, index: number) : void {
        let children = target.chidlren.filter((n) => { return n instanceof CommonHtmlElement; });

        if (index == -1 || index >= children.length) {
            target.append(pageContainer);
        } else {
            target.insertBeforeNode(pageContainer, children[index]);
        }
    }

    protected _wrapItem(content: Node, domManipulator: DomManipulator) : CommonHtmlElement {
        let wrapper: CommonHtmlElement = domManipulator.createNewFragment(Renderer.WRAPPER_TEMPLATE);
        wrapper.append(domManipulator.mapNode(content));
        return wrapper;
    }
}


export class Controller extends SizeableComponent {

    private _duration: number;

    public goto(pageName: string) : void {
        let container: CommonHtmlElement = this._getItemContainer();
        let targetItem: CommonHtmlElement = this._findItemByName(container, pageName);
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
        let timeStep: number = 1000 / 30;
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

    private _findItemByName(container: CommonHtmlElement, name: string) : CommonHtmlElement {
        let result: CommonHtmlElement = null;
        let children: CommonNodeList = container.chidlren;

        for (let child of children) {
            let childElement: CommonHtmlElement = <CommonHtmlElement>child;

            try {
                if (childElement.attributes.get("name").value == name) {
                    result = childElement;
                    break;
                }
            } catch (err) {
                console.log(err);
            }
        }

        if (result === null)
            throw new Error("Page '" + name + "' not found");

        return result;
    }
}


export let register: Function = registerFunctionFactory("owl.component.layout.slider", "owlSlider", Renderer, Controller);
