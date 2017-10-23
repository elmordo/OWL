
import { AbstractRenderer, RenderResult, EntryNodeLookup } from "../../../rendering"
import { DomManipulator, CommonHtmlNode, CommonHtmlText, CommonHtmlElement } from "../../../dom"
import { ControllerBase, ComponentFactory, ComponentDescription } from "../../../component"
import { ServiceManager, ServiceNamespace } from "../../../service_management"


export abstract class ButtonRendererBase extends AbstractRenderer {

    static CONTAINER_TEMPLATE = "<span class='owl-button-outer'><span class='owl-button-inner'></span></span>";

    static ENTRY_LABEL = "label";

    public render(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object) : RenderResult {
        let wrapper: RenderResult = this._renderWrapper(originalNode, manipulator, options);
        let button = this._renderButton(originalNode, manipulator, options);

        this._insertButtonToWrapper(button, wrapper.entryNodes);
        this._setupLookup(button, wrapper.entryNodes);

        return wrapper;
    }

    public getOptions(originalNode: CommonHtmlElement) : Object {
        let result = super.getOptions(originalNode);
        result["label"] = this._getAttributeValue(originalNode, "label", "button");

        return result;
    }

    protected _insertButtonToWrapper(button: CommonHtmlElement, wrapperLookup: EntryNodeLookup) : void {
        (<CommonHtmlElement>wrapperLookup["inner"]).append(button);
    }

    protected _setupLookup(button: CommonHtmlElement, wrapperLookup: EntryNodeLookup) : void {
        wrapperLookup["button"] = button;
        wrapperLookup["label"] = button.chidlren.getFirst();
    }

    protected _renderWrapper(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object) : RenderResult {
        let wrapper = manipulator.createNewFragment(ButtonRendererBase.CONTAINER_TEMPLATE);
        let entryNodes = new EntryNodeLookup();

        entryNodes["outer"] = wrapper;
        entryNodes["inner"] = wrapper.chidlren.getFirst();

        let result: RenderResult = new RenderResult(wrapper, entryNodes);
        return result;
    }

    protected abstract _renderButton(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object) : CommonHtmlElement;
}


export class ButtonController extends ControllerBase {

    private _label: CommonHtmlText;

    constructor() {
        super();
    }

    public setup(renderedContent: RenderResult, options: Object) : void {
        super.setup(renderedContent, options);
        this._label = <CommonHtmlText>renderedContent.getEntry(ButtonRendererBase.ENTRY_LABEL);

        this.label = options["label"] || this.label;
    }

    get label(): string {
        return this._label.content;
    }

    set label(val: string) {
        this._label.content = val;
    }
}
