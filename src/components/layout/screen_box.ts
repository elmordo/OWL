
import { AbstractRenderer, RenderResult, EntryNodeLookup } from "../../rendering"
import { ControllerBase, ComponentFactory, ComponentDescription } from "../../component"
import { ServiceManager } from "../../service_management"
import { CommonHtmlNode, CommonHtmlElement, DomManipulator } from "../../dom"


export class Renderer extends AbstractRenderer {

    static TEMPLATE: string = "<div class='owl-screenbox'></div>";

    public render(originalNode: CommonHtmlNode, manipulator: DomManipulator, options: Object) : RenderResult {
        let rootNode: CommonHtmlElement = manipulator.createNewFragment(Renderer.TEMPLATE);
        let entryNodes: EntryNodeLookup = new EntryNodeLookup();

        while (originalNode.node.childNodes.length)
            rootNode.node.appendChild(originalNode.node.firstChild);

        let result: RenderResult = new RenderResult(rootNode, entryNodes);
        return result;
    }

}


export class Controller extends ControllerBase {

}


export function register(cf: ComponentFactory, sm: ServiceManager): void {
    let baseNs = "owl.component.layout.screenbox";

    let rendererName: string = baseNs + ".renderer";
    let controllerName: string = baseNs + ".controller";

    sm.registerService(rendererName, () => { return new Renderer(); });
    sm.registerService(controllerName, () => { return new Controller(); });

    let dsc: ComponentDescription = new ComponentDescription("owlScreenbox", rendererName, controllerName);
    cf.registerComponent(dsc);
}
