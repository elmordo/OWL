
import { AbstractRenderer, RenderResult } from "../../rendering"
import { ControllerBase } from "../../component"
import { CommonHtmlNode, CommonHtmlElement, DomManipulator } from "../../dom"


export class Renderer extends AbstractRenderer {

    public render(originalNode: CommonHtmlNode, manipulator: DomManipulator, options: Object) : RenderResult {
        // code...
    }

}


export class Controller extends ControllerBase {

}
