
import { expect } from "chai"

import { DomManipulator, CommonHtmlElement } from "../../../src/dom"
import { createDomManipulator, appendSampleFragment } from "./utils"


describe("Html element", () => {

    it("get children", () => {
        let manipulator = createDomManipulator();
        let fragment = appendSampleFragment(manipulator);
        let chilren = fragment.chidlren;

        expect(chilren).length(4);
    });
});
