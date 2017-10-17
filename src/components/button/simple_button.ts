
import { AbstractRenderer, RenderResult, EntryNodeLookup } from "../../rendering"
import { DomManipulator, CommonHtmlNode, CommonHtmlText, CommonHtmlElement } from "../../dom"
import { ControllerBase, ComponentManager, ComponentDescription } from "../../component"
import { ServiceManager, ServiceNamespace } from "../../service_management"


export class Renderer extends AbstractRenderer {

    static BUTTON_TEMPLATE = "<button type='button'>button</button>";

    static ENTRY_LABEL = "label";

    public render(manipulator: DomManipulator, options: Object) : RenderResult {
        let button = manipulator.createNewFragment(Renderer.BUTTON_TEMPLATE);
        let entryNodes = new EntryNodeLookup();

        entryNodes["label"] = button.chidlren.getFirst();

        let result: RenderResult = new RenderResult(button, entryNodes);
        return result;
    }

    public getOptions(originalNode: CommonHtmlElement) : Object {
        let result = super.getOptions(originalNode);
        result["label"] = this.getAttributeValue(originalNode, "label", "button");

        return result;
    }
}


export class Controller extends ControllerBase {;

    private _label: CommonHtmlText;

    constructor() {
        super();
    }

    public setup(renderedContent: RenderResult, options: Object) : void {
        super.setup(renderedContent, options);
        this._label = <CommonHtmlText>renderedContent.getEntry(Renderer.ENTRY_LABEL);
    }

    get label(): string {
        return this._label.content;
    }

    set label(val: string) {
        this._label.content = val;
    }
}


export function register(cm: ComponentManager, sm: ServiceManager): void {
    let baseNs = "owl.component.button.simple";

    let rendererName: string = baseNs + ".renderer";
    let controllerName: string = baseNs + ".controller";

    sm.registerService(rendererName, () => { return new Renderer(); });
    sm.registerService(controllerName, () => { return new Controller(); });

    let dsc: ComponentDescription = new ComponentDescription("owlSimpleButton", rendererName, controllerName);
    cm.registerComponent(dsc);
    console.log("reg");
}
