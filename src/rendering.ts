
import { DomManipulator, CommonHtmlNode, CommonHtmlElement } from "./dom";

/**
 * interface for all renderers
 */
export interface IRenderer {

    /**
     * render component to dom
     * @param {CommonHtmlElement} originalNode the original node
     * @param {DomManipulator} manipulator dom manipulator
     * @param {Object} options rendering options
     * @return {RenderResult} render result
     */
    render(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object): RenderResult;

    /**
     * read options from the original node
     * @param {CommonHtmlNode} originalNode original node
     * @return {Object} parsed options
     */
    getOptions(originalNode: CommonHtmlNode): Object;
}


export abstract class AbstractRenderer implements IRenderer {

    /**
     * render component to dom
     * @param {CommonHtmlElement} originalNode the original node
     * @param {DomManipulator} manipulator dom manipulator
     * @param {Object} options rendering options
     * @return {RenderResult} render result
     */
    abstract render(originalNode: CommonHtmlElement, manipulator: DomManipulator, options: Object): RenderResult;

    /**
     * read options from the original node
     * @param {CommonHtmlNode} originalNode original node
     * @return {Object} parsed options
     */
    public getOptions(originalNode: CommonHtmlNode): Object {
        let result = new Object();

        if (originalNode instanceof CommonHtmlElement) {
            let element = <CommonHtmlElement>originalNode;

            result["id"] = this._getAttributeValue(originalNode, "id");
            result["classes"] = element.styles.getClasses();
        }

        return result;
    }

    protected _setupId(target: CommonHtmlElement, options: Object) : void {
        if (options["id"])
            target.attributes.set("id", options["id"]);
    }

    protected _setupClassNames(target: CommonHtmlElement, options: Object) : void {
        if (options["classes"])
            for (let className of options["classes"])
                target.styles.addClass(className);
    }

    protected _getAttributeValue(element: CommonHtmlElement, name: string, defaultValue: string=null) : string {
        let result: string = defaultValue;

        if (element.attributes.has(name))
            result = element.attributes.get(name).value;

        return result;
    }

    protected _copyContent(source: CommonHtmlElement, target: CommonHtmlElement) : void {
        for (let c of source.chidlren) {
            target.append(c);
        }
    }
}


/**
 * hold rendered DOM nodes
 */
export class RenderResult {

    /**
     * the root node
     * @type {CommonHtmlNode}
     */
    private _rootNode: CommonHtmlNode;

    /**
     * entry nodes for inserting some content
     * @type {EntryNodeLookup}
     */
    private _entryNodes: EntryNodeLookup;

    /**
     * initialize instance
     * @param {CommonHtmlNode} rootNode root node
     * @param {EntryNodeLookup} entryNodes entry nodes
     */
    constructor(rootNode: CommonHtmlNode, entryNodes: EntryNodeLookup) {
        this._rootNode = rootNode;
        this._entryNodes = entryNodes;
    }

    /**
     * get entry node
     * @param {string} name name of the entry node
     * @return {CommonHtmlNode} entry node
     * @throws Error entry node does not exist
     */
    public getEntry(name: string) : CommonHtmlNode {
        this._assertEntryExists(name);
        return this._entryNodes[name];
    }

    /**
     * get root node
     * @return {CommonHtmlNode} root node
     */
    get rootNode(): CommonHtmlNode {
        return this._rootNode;
    }

    /**
     * return root node as element
     * @return {CommonHtmlElement} root node retyped as element
     */
    get rootElement(): CommonHtmlElement {
        return <CommonHtmlElement>this._rootNode;
    }

    /**
     * entry nodes accessor
     * @return {EntryNodeLookup} entry nodes
     */
    get entryNodes(): EntryNodeLookup {
        return this._entryNodes;
    }

    /**
     * throw error if entry node does not exist
     * @param {string} name name of the etry node
     * @throws Error entry node does not exist
     */
    private _assertEntryExists(name: string) : void {
        if (!this._entryNodes[name])
            throw new Error("Entry node '" + name + "' does not exist");
    }
}


/**
 * the key is entry node name
 * the value is entry node
 */
export class EntryNodeLookup {
    [name: string]: CommonHtmlNode;
}
