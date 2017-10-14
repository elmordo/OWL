import { DomManipulator, CommonHtmlElement } from "owlonweb"
import { expect } from "chai"


describe("Test dom manipulator", () => {

    function createRootElement() {
        let html = "<div></div>";
        let parser: DOMParser = new DOMParser();

        let element = parser.parseFromString(html, "text/html");
        return element;
    }

    it("test constructor", () => {
        let element = createRootElement();
        let manipulator = new DomManipulator(null, element);
    });
});
