
import { AbstractRenderer, RenderResult, EntryNodeLookup } from "../../rendering"
import { DomManipulator, CommonHtmlNode, CommonHtmlText, CommonHtmlElement } from "../../dom"
import { ControllerBase, registerFunctionFactory } from "../../component"
import { ServiceManager, ServiceNamespace } from "../../service_management"


export class Renderer extends AbstractRenderer {

    static LABEL_TEMPLATE = "<span>label</span>";

    static ENTRY_LABEL = "label";

    public render(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object) : RenderResult {
        let result: RenderResult = this._render(originalNode, manipulator, options);
        this._setupClassNames(<CommonHtmlElement>result.rootNode, options);

        return result;
    }

    public getOptions(originalNode: CommonHtmlNode): Object {
        let result = super.getOptions(originalNode);
        result["label"] = this._getAttributeValue(<CommonHtmlElement>originalNode, "label", "label");
        return result;
    }

    protected _render(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object) : RenderResult {
        let button = manipulator.createNewFragment(Renderer.LABEL_TEMPLATE);
        let entryNodes = new EntryNodeLookup();

        entryNodes["label"] = button.chidlren.getFirst();

        let result: RenderResult = new RenderResult(button, entryNodes);
        return result;
    }
}


export class Controller extends ControllerBase {;

    private _label: CommonHtmlText;

    public setup(renderedContent: RenderResult, options: Object) : void {
        super.setup(renderedContent, options);
        this._label = <CommonHtmlText>renderedContent.getEntry(Renderer.ENTRY_LABEL);

        this.label = options["label"] || this.label;
    }

    get label(): string {
        return this._label.content;
    }

    set label(val: string) {
        this._label.content = val;
    }
}


export let register = registerFunctionFactory("owl.component.text_label", "owlTextLabel", Renderer, Controller);
