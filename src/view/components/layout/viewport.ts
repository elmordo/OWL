
import { AbstractRenderer, RenderResult, EntryNodeLookup } from "../../../rendering"
import { SizeableComponent, ComponentFactory, ComponentDescription } from "../../../component"
import { ServiceManager } from "../../../service_management"
import { CommonHtmlNode, CommonHtmlElement, DomManipulator } from "../../../dom"


export class Renderer extends AbstractRenderer {

    static TEMPLATE: string = "<div class='owl-viewport'></div>";

    public render(originalNode: CommonHtmlNode, manipulator: DomManipulator, options: Object) : RenderResult {
        let rootNode: CommonHtmlElement = manipulator.createNewFragment(Renderer.TEMPLATE);
        let entryNodes: EntryNodeLookup = new EntryNodeLookup();

        while (originalNode.node.childNodes.length)
            rootNode.node.appendChild(originalNode.node.firstChild);

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

        return result;
    }
}


export class Controller extends SizeableComponent {

    /**
     * setup the instance
     * @param {Object} options options to setup
     */
    public setup(renderedContent: RenderResult, options: Object) : void {
        this._setupDefaultOptions(options);
        super.setup(renderedContent, options);
    }

    protected _setupDefaultOptions(options: Object) : void {
        options["sizer"] = options["sizer"] || "fitParent";
    }

}


export function register(cf: ComponentFactory, sm: ServiceManager): void {
    let baseNs = "owl.component.layout.viewport";

    let rendererName: string = baseNs + ".renderer";
    let controllerName: string = baseNs + ".controller";

    sm.registerService(rendererName, () => { return new Renderer(); });
    sm.registerService(controllerName, () => { return new Controller(); });

    let dsc: ComponentDescription = new ComponentDescription("owlViewport", rendererName, controllerName);
    cf.registerComponent(dsc);
}
