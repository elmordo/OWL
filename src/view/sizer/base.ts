import { CommonHtmlNode, CommonHtmlElement } from "../../dom"
import { EventDispatcher, OwlEvent } from "../../events"


/**
 * common sizer interface
 */
export interface ISizer extends EventDispatcher {

    /**
     * update size of the sized element
     */
    updateSize(): void;

    /**
     * setup instance
     * @param {CommonHtmlNode} node node to manage
     * @param {Object} options options
     */
    setup(node: CommonHtmlNode, options: Object): void;

    /**
     * tear down the sizer (unbind event listeners, etc)
     */
    teardown(): void;

}


/**
 * manage available types of the sizers
 */
export class SizerFactory {

    /**
     * set of sizers
     * @type {SizerLookup}
     */
    private _sizers: SizerLookup;

    /**
     * initialize instance
     */
    constructor() {
        this._sizers = new SizerLookup();
    }

    /**
     * register sizer to the manager
     * @param {string} name name of the sizer
     * @param {Function} factory sizer factory function
     */
    public addSizer(name: string, factory: Function) : void {
        if (this._sizers[name])
            throw new Error("Sizer '" + name + "' does exist.");
        this._sizers[name] = factory;
    }

    /**
     * get sizer instance
     * @param {string} name name of the sizer
     * @return {ISizer} sizer instance
     */
    public getSizer(name: string) : ISizer {
        if (!this._sizers[name])
            throw new Error("Sizer '" + name + "' does not exist.");

        return this._sizers[name]();
    }
}


/**
 * the abstract sizer with common shared functionality
 */
export abstract class ASizer extends EventDispatcher implements ISizer {

    static EVENT_RESIZE = "resize";

    /**
     * node to size
     * @type {CommonHtmlNode}
     */
    protected _node: CommonHtmlNode;

    /**
     * sizer options
     * @type {Object}
     */
    protected _options: Object;

    private _oldWidth: number = 0;

    private _oldHeight: number = 0;

    /**
     * update size of the node
     */
    public abstract updateSize(): void;

    /**
     * setup the instance
     * @param {CommonHtmlNode} node node to size
     * @param {Object} options options
     */
    public setup(node: CommonHtmlNode, options: Object): void {
        this._node = node;
        this._options = options;
    }

    public teardown() : void {
        // do nothing
    }

    protected _dispatchResizeEventIfChanged(newWidth: number, newHeight: number) : void {
        if (this._oldWidth != newWidth || this._oldHeight != newHeight) {
            this._oldWidth = newWidth;
            this._oldHeight = newHeight;

            let event: OwlEvent = new OwlEvent(ASizer.EVENT_RESIZE);
            this.dispatchEvent(event);
        }
    }
}


/**
 * fit element to parent's dimension
 */
export class FitParent extends ASizer {

    /**
     * callback for resize event
     * @type {Function}
     */
    private _callback;

    /**
     * update element size
     */
    public updateSize(): void {
        let parent: HTMLElement = this._getOffsetParent();
        let element = <CommonHtmlElement>this._node;

        let styles = element.styles;
        styles.set("width", parent.clientWidth + "px");
        styles.set("height", parent.clientHeight + "px");

        styles.set("width", "100%");
        styles.set("height", "100%");

        this._dispatchResizeEventIfChanged(parent.clientWidth, parent.clientHeight);
    }

    /**
     * setup instance
     * @param {CommonHtmlNode} node node to manage
     * @param {Object} options options
     */
    public setup(node: CommonHtmlNode, options: Object): void {
        super.setup(node, options);
        this._callback = () => { this.updateSize() };

        window.addEventListener("resize", this._callback);
    }

    /**
     * remove registered event listeners
     */
    public teardown(): void {
        window.removeEventListener("resize", this._callback);
    }

    private _getOffsetParent(): HTMLElement {
        let parent: HTMLElement = <HTMLElement>(<HTMLElement>this._node.node).offsetParent;

        if (parent == null)
            parent = this._node.node.parentElement;

        if (parent == null)
            throw new Error("Parent was not found");

        return parent;
    }
}


export class FitWindow extends ASizer {

    /**
     * callback for resize event
     * @type {Function}
     */
    private _callback;
    /**
     * update element size
     */
    public updateSize(): void {
        let element = <CommonHtmlElement>this._node;
        element.styles.set("width", window.innerWidth + "px");
        element.styles.set("height", window.innerHeight + "px");
        this._dispatchResizeEventIfChanged(window.innerWidth, window.innerHeight);
    }

    /**
     * setup instance
     * @param {CommonHtmlNode} node node to manage
     * @param {Object} options options
     */
    public setup(node: CommonHtmlNode, options: Object) : void {
        super.setup(node, options);
        this._callback = () => { this.updateSize() };

        window.addEventListener("resize", this._callback);
    }

    /**
     * remove registered event listeners
     */
    public teardown() : void {
        window.removeEventListener("resize", this._callback);
    }
}


class SizerLookup {
    [key: string]: Function;
}
