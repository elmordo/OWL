
import { DomManipulator, CommonHtmlNode, CommonHtmlElement, CommonHtmlAttribute, CommonHtmlComment, CommonHtmlText } from "../../../src/dom"

export function createRootElement() {
    return document.createElement("div");
}

export function createSampleHtml(): string {
    return "<span><!-- this is comment -->foo<p id=\"my-id\">bar</p>foobar</span>";
}

export function createDomManipulator() {
    return new DomManipulator(window, createRootElement());
}

export function createSampleFragment(manipulator: DomManipulator): CommonHtmlElement {
    let html: string = createSampleHtml();
    return manipulator.createNewFragment(html);
}

export function appendSampleFragment(manipulator: DomManipulator) {
    let fragment: CommonHtmlElement = createSampleFragment(manipulator);
    manipulator.rootElement.append(fragment);
    return fragment;
}