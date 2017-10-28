
import { AbstractRenderer, RenderResult, EntryNodeLookup } from "../../../rendering"
import { ComponentFactory, ComponentDescription, registerFunctionFactory } from "../../../component"
import { ServiceManager } from "../../../service_management"
import { CommonHtmlNode, CommonHtmlElement, DomManipulator } from "../../../dom"
import { ContainerController } from "../base"


export class Renderer extends AbstractRenderer {

    static TEMPLATE: string = "<div class='owl-viewport'></div>";

    public render(originalNode: CommonHtmlNode, manipulator: DomManipulator, options: Object) : RenderResult {
        let rootNode: CommonHtmlElement = manipulator.createNewFragment(Renderer.TEMPLATE);
        let entryNodes: EntryNodeLookup = new EntryNodeLookup();

        this._setupClassNames(rootNode, options);

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


export class Controller extends ContainerController {

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


export let register: Function = registerFunctionFactory("owl.component.layout.viewport", "owlViewport", Renderer, Controller);
