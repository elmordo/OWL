
export class DomManipulator {

    readonly window: Window;

    readonly rootElement: CommonHtmlElement;

    private _cache: MappedElementCache;

    private _nodeTypeLookup: NodeMapperAbstractFactoryLookup;

    constructor (window: Window, rootElement: HTMLElement) {
        this.window = window;
        this.rootElement = <CommonHtmlElement>this.mapNode(rootElement);

        this._cache = new MappedElementCache(window.document);
        this._nodeTypeLookup = new NodeMapperAbstractFactoryLookup();

        this._initializeLookup();
    }

    public createNewFragment(html: string) : CommonHtmlElement {
        let parser: DOMParser = new DOMParser();
        let fragment: DocumentFragment = parser.parseFromString(html, "text/xml");
        let element: HTMLElement = <HTMLElement>fragment.firstChild;

        return <CommonHtmlElement>this.mapNode(element);
    }

    public mapNode(node:Node) : CommonHtmlNode {
        // TODO: real mapping
        return new CommonHtmlElement(node, this);
    }

    private _initializeLookup() : void {
        this._initializeAttrLookup();
        this._initializeTextLookup();
        this._initializeElementLookup();
        this._initializeCommentLookup();
    }

    private _initializeAttrLookup() : void {
        this._nodeTypeLookup[Node.ATTRIBUTE_NODE] = new NodeMapperAbstractFactory();
    }

    private _initializeTextLookup() : void {
        this._nodeTypeLookup[Node.TEXT_NODE] = new NodeMapperAbstractFactory();
    }

    private _initializeElementLookup() : void {
        this._nodeTypeLookup[Node.ELEMENT_NODE] = new NodeMapperAbstractFactory();
    }

    private _initializeCommentLookup() : void {
        this._nodeTypeLookup[Node.COMMENT_NODE] = new NodeMapperAbstractFactory();
    }
}

export function domManipulatorFactory(window: Window, rootElement: HTMLElement) : DomManipulator {
    let manipulator: DomManipulator = new DomManipulator(window, rootElement);

    return manipulator;
}

class NodeMapperAbstractFactoryLookup {
    [key: number]: NodeMapperAbstractFactory;
}

class NodeMapperAbstractFactory {
    public getFactory(node: Node) : INodeMapperFactory {
        return null;
    }
}

interface INodeMapperFactory {
    createMapper(node: Node) : CommonHtmlNode;
}

/**
 * contains <cache id>-<mapped element> pairs
 */
class MappedElementLookup {
    [key: number]: CommonHtmlElement;
}

/**
 * hold already mapped elements
 */
class MappedElementCache {

    /**
     * attribute name where OOW internal id is stored
     * @type {String}
     */
    public static ELEMENT_INTERNAL_ID_NAME = "oow-id";

    /**
     * id of next cached element
     * @type {number}
     */
    private static _nextId: number;

    /**
     * container with cached elements
     * @type {MappedElementLookup}
     */
    private _cache: MappedElementLookup;

    /**
     * parent document
     * @type {Document}
     */
    private _document: Document;

    /**
     * initialize instance
     */
    constructor(document: Document) {
        this._cache = new MappedElementLookup();
        this._document = document;
    }

    /**
     * is element cached?
     * @param {HTMLElement} element element to test
     * @return {boolean} true if element is cached, false otherwise
     */
    public isCached(element: HTMLElement) : boolean {
        return this._hasElementId(element);
    }

    /**
     * add element to the cache
     * @param {CommonHtmlElement} mappedElement mapped element to add
     */
    public addElement(mappedElement: CommonHtmlElement) : void {
        let id:number = this._setElementId(mappedElement.element);
        this._cache[id] = mappedElement;
    }

    /**
     * get mapped element from the cache
     * @param {HTMLElement} element raw HTML element
     * @return {CommonHtmlElement} cached element
     * @throws Error element is not cached
     */
    public getCached(element: HTMLElement) : CommonHtmlElement {
        let id: number = this._getElementId(element);
        return this._cache[id];
    }

    /**
     * remove element from the cache
     * @param {HTMLElement} element raw HTML element to remove
     * @throws Error element is not in cache
     */
    public removeElement(element: HTMLElement) : void {
        let id: number = this._getElementId(element);
        delete this._cache[id];
    }

    /**
     * test if element has cache id
     * @param {HTMLElement} element raw HTML element to test
     * @return {boolean} true if element has cache id
     */
    private _hasElementId(element: HTMLElement) : boolean {
        return element.attributes.getNamedItem(MappedElementCache.ELEMENT_INTERNAL_ID_NAME) !== null;
    }

    /**
     * get element cache id
     * @param {HTMLElement} element raw HTML element
     * @return {number} element's cache id
     * @throws Error element has no cache id
     */
    private _getElementId(element: HTMLElement) : number {
        let attr: Attr = element.attributes.getNamedItem(MappedElementCache.ELEMENT_INTERNAL_ID_NAME);

        if (attr === null) throw new Error("Element is not cached");

        return Number(attr.value);
    }

    /**
     * set new cache id to the element
     * @param {HTMLElement} element raw HTML element
     * @return {number} new assigned cache id
     */
    private _setElementId(element: HTMLElement) : number {
        let id: number = MappedElementCache._nextId++;

        let attr: Attr = this._document.createAttribute(MappedElementCache.ELEMENT_INTERNAL_ID_NAME);
        attr.value = id.toString();
        element.attributes.setNamedItem(attr);

        return id;
    }
}


class AttributeCache {
    [key: string]: CommonHtmlAttribute;
}

export class CommonHtmlNode {

    protected _node: Node;

    protected _domManipulator: DomManipulator;

    constructor(node: Node, manipulator: DomManipulator) {
        this._node = node;
        this._domManipulator = manipulator;
    }

    get node() : Node {
        return this._node;
    }

    get parent() : Node {
        return this._node.parentNode;
    }

    get domManipulator() : DomManipulator {
        return this._domManipulator;
    }
}

export class CommonHtmlElement extends CommonHtmlNode {

    constructor(node: Node, manipulator: DomManipulator) {
        super(node, manipulator);
    }

    get element(): HTMLElement {
        return <HTMLElement>this.node;
    }

};

/**
 * wraps attribute (Attr class instance)
 */
export class CommonHtmlAttribute extends CommonHtmlNode {

    /**
     * initialize instance
     * @param {Attr} attribute attribute to wrap
     * @param {DomManipulator} manipulator original manipulator
     */
    constructor(attribute: Attr, manipulator: DomManipulator) {
        super(attribute, manipulator);
    }

    /**
     * wrapped attribute
     * @return {Attr} wrapped attribute
     */
    get attribute(): Attr {
        return <Attr>this.node;
    }

    /**
     * get attribute name
     * @return {string} attribute name
     */
    get name(): string {
        return this.attribute.name;
    }

    /**
     * get attribute value
     * @return {string} attribute value
     */
    get value(): string {
        return this.attribute.value;
    }

    /**
     * set attribute value
     * @param {string} val new attribute value
     */
    set value(val: string) {
        this.attribute.value = val;
    }
}

/**
 * wraps text node
 */
export class CommonTextNode extends CommonHtmlNode {

    /**
     * initialize instance
     * @param {Text} node original raw text node
     * @param {DomManipulator} manipulator dom manipulator
     */
    constructor(node: Text, manipulator: DomManipulator) {
        super(node, manipulator);
    }

    /**
     * return wrapped raw node as Text
     * @return {Text} [description]
     */
    get text(): Text {
        return <Text> this.node;
    }

    /**
     * get text content
     * @return {string} stored content
     */
    get content(): string {
        return this.text.textContent;
    }

    /**
     * set stored content
     * @param {string} val new content of the text node
     */
    set content(val: string) {
        this.text.textContent = val;
    }
}

/**
 * represent comment node
 */
export class CommonCommentNode extends CommonHtmlNode {

    /**
     * initialize instance
     * @param {Node} node node to wrap
     * @param {DomManipulator} manipulator manipulator
     */
    constructor(node: Node, manipulator: DomManipulator) {
        super(node, manipulator);
    }

    /**
     * get wrapped comment node
     */
    get comment(): Comment {
        return <Comment>this.node;
    }

    /**
     * get comment content
     * @return {string} comment content
     */
    get content(): string {
        return this.comment.text;
    }

    /**
     * set new comment content
     * @param {string} val new comment content
     */
    set content(val: string) {
        this.comment.text = val;
    }
}
