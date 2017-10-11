
export namespace OOW {

    /**
     * can modify dom
     */
    export class DomManipulator {

        /**
         * window object
         * @type {Window}
         */
        readonly window: Window;

        /**
         * root element of the manipulator
         * @type {CommonHtmlElement}
         */
        readonly rootElement: CommonHtmlElement;

        /**
         * cache of the manipulated objects
         * @type {MappedNodeCache}
         */
        private _cache: MappedNodeCache;

        /**
         * create new manipulator instance
         * @param {Window} window window object
         * @param {HTMLElement} rootElement root element
         */
        constructor (window: Window, rootElement: HTMLElement) {
            this.window = window;
            this.rootElement = <CommonHtmlElement>this.mapNode(rootElement);
        }

        /**
         * parse HTML from the string
         * @param {string} html HTML source
         * @return {CommonHtmlNode} parsed data
         */
        public createNewFragment(html: string) : CommonHtmlNode {
            let parser: DOMParser = new DOMParser();
            let fragment: DocumentFragment = parser.parseFromString(html, "text/xml");
            let rootNode: Node = fragment.firstChild;

            return this.mapNode(rootNode);
        }

        /**
         * map node by wrapper class
         * @param {Node} node raw html node to wrap
         * @return {CommonHtmlNode} wrapped node
         */
        public mapNode(node:Node) : CommonHtmlNode {
            // TODO: real mapping
            return new CommonHtmlNode(node, this);
        }

        /**
         * return cache
         * @return {MappedNodeCache} cache instance
         */
        get cache() : MappedNodeCache {
            return this._cache;
        }
    }

    /**
     * create dom manipulator for current platform
     * @param {Window} window window object
     * @param {HTMLElement} rootElement root element
     * @return {DomManipulator} final manipulator
     */
    function domManipulatorFactory(window: Window, rootElement: HTMLElement) : DomManipulator {
        let manipulator: DomManipulator = new DomManipulator(window, rootElement);
        return manipulator;
    }


    /**
     * contains <cache id>-<mapped element> pairs
     */
    class MappedNodeLookup {

        [key: number]: CommonHtmlNode;
    }

    /**
     * hold already mapped elements
     */
    class MappedNodeCache {

        /**
         * attribute name where OOW internal id is stored
         * @type {String}
         */
        public static ATTR_WITH_HASH = "__oowId__";

        /**
         * id of next cached element
         * @type {number}
         */
        private static _nextId: number;

        /**
         * container with cached elements
         * @type {MappedNodeLookup}
         */
        private _cache: MappedNodeLookup;

        /**
         * parent document
         * @type {Document}
         */
        private _document: Document;

        /**
         * initialize instance
         */
        constructor(document: Document) {
            this._cache = new MappedNodeLookup();
            this._document = document;
        }

        /**
         * is node cached?
         * @param {Node} node node to test
         * @return {boolean} true if element is cached, false otherwise
         */
        public isCached(node: Node) : boolean {
            return this._hasNodeId(node);
        }

        /**
         * add node to the cache
         * @param {CommonHtmlNode} mappedNode mapped node to add
         */
        public addElement(mappedNode: CommonHtmlNode) : void {
            let id:number = this._setNodeId(mappedNode.node);
            this._cache[id] = mappedNode;
        }

        /**
         * get mapped node from the cache
         * @param {Node} node raw HTML node
         * @return {CommonHtmlNode} cached mapped node
         * @throws Error node is not cached
         */
        public getCached(node: Node) : CommonHtmlNode {
            let id: number = this._getNodeId(node);
            return this._cache[id];
        }

        /**
         * remove node from the cache
         * @param {Node} node raw HTML node to remove
         * @throws Error node is not in cache
         */
        public removeNode(node: Node) : void {
            let id: number = this._getNodeId(node);
            delete this._cache[id];
        }

        /**
         * test if node has cache id
         * @param {Node} node raw HTML node to test
         * @return {boolean} true if node has cache id
         */
        private _hasNodeId(node: Node) : boolean {
            return (<any>node)[MappedNodeCache.ATTR_WITH_HASH] !== undefined;
        }

        /**
         * get node cache id
         * @param {Node} node raw HTML node
         * @return {number} node's cache id
         * @throws Error node has no cache id
         */
        private _getNodeId(node: Node) : number {
            let id = (<any>node)[MappedNodeCache.ATTR_WITH_HASH];
            return Number(id);
        }

        /**
         * set new cache id to the node
         * @param {Node} node raw HTML node
         * @return {number} new assigned cache id
         */
        private _setNodeId(node: Node) : number {
            let id: number = MappedNodeCache._nextId++;
            (<any>node)[MappedNodeCache.ATTR_WITH_HASH] = id;
            return id;
        }
    }

    /**
     * base of all nodes
     */
    export class CommonHtmlNode {

        /**
         * wrapped node
         * @type {Node}
         */
        protected _node: Node;

        /**
         * source dom manipulator (creator of the instance)
         * @type {DomManipulator}
         */
        protected _domManipulator: DomManipulator;

        /**
         * create and initialize new instance
         * @param {Node} node node to wrap
         * @param {DomManipulator} manipulator creator of the instance
         */
        constructor(node: Node, manipulator: DomManipulator) {
            this._node = node;
            this._domManipulator = manipulator;
        }

        /**
         * dettach node from the DOM
         * node persists in memory
         */
        public detach() : void {
            if (this._node.parentNode)
                this._node.parentNode.removeChild(this._node);
        }

        /**
         * dettach node from the DOM and destroy instance
         */
        public destroy() : void {
            this.detach();
            this._domManipulator.cache.removeNode(this._node);
            this._node = null;
        }

        /**
         * wrapped node accessor
         * @return {Node} wrapped node
         */
        get node() : Node {
            return this._node;
        }

        /**
         * parent of the node (owner element)
         * @return {Node} parent of the node
         */
        get parent() : Node {
            return this._node.parentNode;
        }

        /**
         * parent dom manipulator
         * @return {DomManipulator} [description]
         */
        get domManipulator() : DomManipulator {
            return this._domManipulator;
        }
    }

    export class CommonHtmlAttribute extends CommonHtmlNode {

        constructor(node: Node, manipulator: DomManipulator) {
            super(node, manipulator);
        }
    }

    export class CommonTextNode extends CommonHtmlNode {

        constructor(node: Node, manipulator: DomManipulator) {
            super(node, manipulator);
        }
    }

    export class CommonHtmlElement extends CommonHtmlNode {

        private _cachedAttributes: AttributeCache;

        protected _element: HTMLElement;

        constructor(element: HTMLElement, manipulator: DomManipulator) {
            super(element, manipulator);
            this._element = element;
        }

        get element(): HTMLElement {
            return this._element;
        }
    };

}
