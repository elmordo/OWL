 import { CommonHtmlElement } from "./dom"
 import { ControllerBase } from "./component"
 import { RenderResult, EntryNodeLookup } from "./rendering"



export class Application extends ControllerBase {

    constructor() {
        super("owlApplication");
    }

    public setupApplication(rootElement: CommonHtmlElement) : void {
        let renderResult: RenderResult = new RenderResult(rootElement, new EntryNodeLookup());
        this.setup(renderResult, new Object());
    }
}
