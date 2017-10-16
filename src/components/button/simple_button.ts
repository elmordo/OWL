
import { IRenderer, RenderResult, EntryNodeLookup } from "../../rendering"
import { DomManipulator, CommonHtmlNode, CommonHtmlText } from "../../dom"
import { ControllerBase } from "../../component"


export class SimpleButtonRenderer implements IRenderer {

    static BUTTON_TEMPLATE = "<button type='button'>button</button>";

    static ENTRY_LABEL = "label";

    public render(manipulator: DomManipulator, options: Object) : RenderResult {
        let button = manipulator.createNewFragment(SimpleButtonRenderer.BUTTON_TEMPLATE);
        let entryNodes = new EntryNodeLookup();

        entryNodes["label"] = button.chidlren.first;

        let result: RenderResult = new RenderResult(button, entryNodes);
        return result;
    }

}


export class SimpleButtonController extends ControllerBase {

    private _label: CommonHtmlText;

    constructor() {
        super();
    }

    public setup(renderedContent: RenderResult, options: Object) : void {
        super.setup(renderedContent, options);
        this._label = <CommonHtmlText>renderedContent.getEntry(SimpleButtonRenderer.ENTRY_LABEL);
    }

    get label(): string {
        return this._label.content;
    }

    set label(val: string) {
        this._label.content = val;
    }
}
