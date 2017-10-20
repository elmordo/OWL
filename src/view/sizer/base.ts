import { CommonHtmlNode, CommonHtmlElement } from "../../dom"


export interface ISizer {

    updateSize(node: CommonHtmlNode, options: Object): void;

}


export class SizerManager {

    private _sizers: SizerLookup;

    constructor() {
        this._sizers = new SizerLookup();
    }

    public addSizer(name: string, sizer: ISizer) : void {
        if (this._sizers[name])
            throw new Error("Sizer '" + name + "' does exist.");
        this._sizers[name] = sizer;
    }

    public getSizer(name: string) : ISizer {
        if (!this._sizers[name])
            throw new Error("Sizer '" + name + "' does not exist.");

        return this._sizers[name];
    }
}


export class FitParent {

    public updateSize(node: CommonHtmlNode, options: Object): void {
        let parent: HTMLElement = node.node.parentElement;
        let element = <CommonHtmlElement>node;

        let styles = element.styles;
        styles.set("width", parent.offsetWidth + "px");
        styles.set("height", parent.offsetHeight + "px");
    }
}


export class FitWindow {

    public updateSize(node: CommonHtmlNode, options: Object): void {
        let element = <CommonHtmlElement>node;
        element.styles.set("width", window.innerWidth + "px");
        element.styles.set("height", window.innerHeight + "px");
    }
}


class SizerLookup {
    [key: string]: ISizer;
}
