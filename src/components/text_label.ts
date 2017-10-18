
import { AbstractRenderer, RenderResult, EntryNodeLookup } from "../rendering"
import { DomManipulator, CommonHtmlNode, CommonHtmlText, CommonHtmlElement } from "../dom"
import { ControllerBase, ComponentFactory, ComponentDescription } from "../component"
import { ServiceManager, ServiceNamespace } from "../service_management"


export class Renderer extends AbstractRenderer {

    static LABEL_TEMPLATE = "<span>label</span>";

    static ENTRY_LABEL = "label";

    public render(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object) : RenderResult {
        let button = manipulator.createNewFragment(Renderer.LABEL_TEMPLATE);
        let entryNodes = new EntryNodeLookup();

        entryNodes["label"] = button.chidlren.getFirst();

        let result: RenderResult = new RenderResult(button, entryNodes);
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

        this.label = options["label"] || this.label;
    }

    get label(): string {
        return this._label.content;
    }

    set label(val: string) {
        this._label.content = val;
    }
}


export function register(cm: ComponentFactory, sm: ServiceManager): void {
    let baseNs = "owl.component.text_label";

    let rendererName: string = baseNs + ".renderer";
    let controllerName: string = baseNs + ".controller";

    sm.registerService(rendererName, () => { return new Renderer(); });
    sm.registerService(controllerName, () => { return new Controller(); });

    let dsc: ComponentDescription = new ComponentDescription("owlTextLabel", rendererName, controllerName);
    cm.registerComponent(dsc);
}
