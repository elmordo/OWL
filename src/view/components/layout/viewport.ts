
import { AbstractRenderer, RenderResult, EntryNodeLookup } from "../../../rendering"
import { ControllerBase, ComponentFactory, ComponentDescription } from "../../../component"
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

}


export class Controller extends ControllerBase {

    private _resizeCallback;

    /**
     * setup the instance
     * @param {Object} options options to setup
     */
    public setup(renderedContent: RenderResult, options: Object) : void {
        super.setup(renderedContent, options);
        this._updateDimensions();
        this._resizeCallback = this._updateDimensions.bind(this);

        window.addEventListener("resize", this._resizeCallback);
    }

    private _updateDimensions() : void {
        let width = window.innerWidth;
        let height = window.innerHeight;

        let root = <CommonHtmlElement>this._view.rootNode;
        root.styles.set("width", width + "px");
        root.styles.set("height", height + "px");
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
