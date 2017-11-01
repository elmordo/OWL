
import { ControllerBase } from "../../component"
import { ISizer, SizerFactory, ASizer } from "../sizer/base"
import { RenderResult, AbstractRenderer } from "../../rendering"
import { CommonHtmlElement } from "../../dom"


export class VisualComponentController extends ControllerBase {

    public getSupportedEvents(): string[] {
        return ["click", "mouseenter"];
    }
}


export class DynamicSizeController extends VisualComponentController {

    protected _onTracked(evt: CustomEvent): void {
        this.repaint();
        this._bindResizeEventListener(evt.detail);
    }

    protected _onTrackingReceived(evt: CustomEvent): void {
        this.repaint();
        this._bindResizeEventListener(evt.detail);
    }

    private _bindResizeEventListener(observedController: ControllerBase) : void {
        observedController.addEventListener(ControllerBase.EVENT_RESIZE, () => {
            this.repaint();
        });
    }

}


export class SizeableController extends DynamicSizeController {

    private _sizer: ISizer;

    public setup(renderedContent: RenderResult, options: Object) : void {
        super.setup(renderedContent, options);
        this._setupSizer(options);
    }

    public repaint() : void {
        this._sizer.updateSize();
        super.repaint();
    }

    public _setupSizer(options: Object) : void {
        let sizerType: string = options["sizer"];
        if (!sizerType) sizerType = "auto";

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

    protected abstract _getMainItemContainer(): CommonHtmlElement;

    public setLayout(layoutType: string) : void {
        let itemContainer = this._getMainItemContainer();
        let layoutClass: string;

        switch (layoutType) {
            case "row":
            layoutClass = "owl-layout-row";
            break;

            case "row-reverse":
            layoutClass = "owl-layout-rrow";
            break;

            case "column":
            layoutClass = "owl-layout-column";
            break;

            case "column-reverse":
            layoutClass = "owl-layout-rcolumn";
            break;

            default:
            throw new Error("Invalid layout type '" + layoutType + "'");
        }

        itemContainer.styles.addClass(layoutClass);
    }

    public setMainPosition(position: string) : void {
        this._setPositionClass(position, "main");
    }

    public setCrossPosition(position: string) : void {
        this._setPositionClass(position, "cross");
    }

    protected _setupLayout(options: Object) : void {
        let layoutType = options["layout"];

        if (layoutType) {
            let mainPosition = options["layout-main"];
            let crossPosition = options["layout-cross"];

            this.setLayout(layoutType);

            if (mainPosition) this.setMainPosition(mainPosition);
            if (crossPosition) this.setCrossPosition(crossPosition);
        }
    }

    protected _setPositionClass(positionType: string, direction: string) : void {
        let target: CommonHtmlElement = this._getMainItemContainer();
        let className: string = this._getPositionBaseClassName(direction, positionType);
        target.styles.addClass(className);
    }

    protected _getPositionBaseClassName(direction: string, positionType: string) : string {
        return "owl-layout-position-" + direction + "-" + positionType;
    }
}
