
import { ControllerBase } from "../../component"
import { ISizer, SizerFactory, ASizer } from "../sizer/base"
import { RenderResult, AbstractRenderer } from "../../rendering"
import { CommonHtmlElement } from "../../dom"


export class VisualComponentController extends ControllerBase {

}


export class SizeableController extends VisualComponentController {

    private _sizer: ISizer;

    public setup(renderedContent: RenderResult, options: Object) : void {
        super.setup(renderedContent, options);
        this._setupSizer(options);
    }

    public repaint() : void {
        this._sizer.updateSize();
        super.repaint();
        this._dispatchLocalEvent(ControllerBase.EVENT_RESIZE);
    }

    public _setupSizer(options: Object) : void {
        let sizerType: string = options["sizer"];
        let sizerFactory: SizerFactory = <SizerFactory>this.serviceManager.getServiceByPath("owl.sizerFactory");
        let sizer = sizerFactory.getSizer(sizerType);

        sizer.setup(this._view.rootNode, options);
        this._sizer = sizer;
        this._sizer.updateSize();

        this._sizer.addEventListener(ASizer.EVENT_RESIZE, (evt) => { this.repaint(); });
    }

}


export class ContainerController extends SizeableController {

}


export abstract class ContainerRenderer extends AbstractRenderer {

    public setLayout(layoutType: string) : void {
        switch (layoutType) {
            case "row":
            break;

            case "row-reverse":
            break;

            case "column":
            break;

            case "column-reverse":
            break;

            default:
            throw new Error("Invalid layout type '" + layoutType + "'");
        }
    }

    protected _setupLayout(target: CommonHtmlElement, options: Object) : void {
        let layoutType = options["layout"];

        if (layoutType) {
            let mainPosition = options["layout-main"];
            let crossPosition = options["layout-cross"];

            this.setLayout(layoutType);
        }
    }
}
