
export namespace OOW {

    export class DomManipulator {

        readonly window: Window;

        readonly rootElement: CommonHtmlElement;

        private _cache: ElementCache;

        constructor (window: Window, rootElement: HTMLElement) {
            this.window = window;
            this.rootElement = this.mapElement(rootElement);
        }

        public createNewFragment(html: string) : CommonHtmlElement {
            let parser: DOMParser = new DOMParser();
            let fragment: DocumentFragment = parser.parseFromString(html, "text/xml");
            let element: HTMLElement = <HTMLElement>fragment.firstChild;

            return this.mapElement(element);
        }

        public mapElement(element:HTMLElement) : CommonHtmlElement {
            // TODO: real mapping
            return new CommonHtmlElement(element);
        }

    }

    function domManipulatorFactory(window: Window, rootElement: HTMLElement) : DomManipulator {
        let manipulator: DomManipulator = new DomManipulator(window, rootElement);

        return manipulator;
    }

    class AttributeCache {

        [key: string]: Attribute;

    }

    export class CommonHtmlElement {

        readonly element: HTMLElement;

        private _cachedAttributes: AttributeCache;

        private _manipulator: DomManipulator;

        constructor(element: HTMLElement, manipulator: DomManipulator) {
            this.element = element;
            this._manipulator = manipulator;
        }

    };

    export class Attribute {
        H
    }

}
