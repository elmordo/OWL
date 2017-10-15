
import { DomManipulator, CommonHtmlNode, CommonHtmlElement, CommonHtmlAttribute, CommonHtmlComment, CommonHtmlText } from "../../../src/dom";
import { createSampleFragment, createDomManipulator, createRootElement, createSampleHtml, appendSampleFragment } from "./utils";
import { expect } from "chai";

describe("Test dom manipulator", () => {

    it("parse HTML", () => {
        let html = createSampleHtml();
        let dm = createDomManipulator();

        let parsed = dm.createNewFragment(html);

        expect(parsed.element.outerHTML).to.equal(html);
    });

    it("node cache", () => {
        let manipulator = createDomManipulator();
        let fragment = appendSampleFragment(manipulator);

        let fragmentRoot1 = fragment.chidlren[0];
        let fragmentRoot2 = fragment.chidlren[0];

        expect(fragmentRoot1).to.equal(fragmentRoot2);
    });

    it("map node twice", () => {
        let manipulator = createDomManipulator();

        let node: Node = document.createElement("div");
        let mapped = manipulator.mapNode(node), second = manipulator.mapNode(node);
        expect(mapped).is.equal(second);
    });

});