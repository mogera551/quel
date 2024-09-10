import "jest";
import { canNodeAcceptInput } from "../../src/binder/canNodeAcceptInput";

describe("canNodeAcceptInput", () => {
  it("HTMLInputElement", () => {
    const input = document.createElement("input");
    input.type = "text";
    expect(canNodeAcceptInput(input, "HTMLElement")).toBe(true);
  });
  it("HTMLSelectElement", () => {
    const select = document.createElement("select");
    expect(canNodeAcceptInput(select, "HTMLElement")).toBe(true);
  });
  it("HTMLTextAreaElement", () => {
    const textarea = document.createElement("textarea");
    expect(canNodeAcceptInput(textarea, "HTMLElement")).toBe(true);
  });
  it("HTMLButtonElement", () => {
    const button = document.createElement("button");
    expect(canNodeAcceptInput(button, "HTMLElement")).toBe(false);
  });
  it("HTMLInputElement type=button", () => {
    const button = document.createElement("input");
    button.type = "button";
    expect(canNodeAcceptInput(button, "HTMLElement")).toBe(false);
  });
  it("HTMLInputElement type=checkbox", () => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    expect(canNodeAcceptInput(checkbox, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=color", () => {
    const color = document.createElement("input");
    color.type = "color";
    expect(canNodeAcceptInput(color, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=date", () => {
    const date = document.createElement("input");
    date.type = "date";
    expect(canNodeAcceptInput(date, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=datetime-local", () => {
    const datetimeLocal = document.createElement("input");
    datetimeLocal.type = "datetime-local";
    expect(canNodeAcceptInput(datetimeLocal, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=email", () => {
    const email = document.createElement("input");
    email.type = "email";
    expect(canNodeAcceptInput(email, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=file", () => {
    const file = document.createElement("input");
    file.type = "file";
    expect(canNodeAcceptInput(file, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=hidden", () => {
    const hidden = document.createElement("input");
    hidden.type = "hidden";
    expect(canNodeAcceptInput(hidden, "HTMLElement")).toBe(false);
  });
  it("HTMLInputElement type=image", () => {
    const image = document.createElement("input");
    image.type = "image";
    expect(canNodeAcceptInput(image, "HTMLElement")).toBe(false);
  });
  it("HTMLInputElement type=month", () => {
    const month = document.createElement("input");
    month.type = "month";
    expect(canNodeAcceptInput(month, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=number", () => {
    const number = document.createElement("input");
    number.type = "number";
    expect(canNodeAcceptInput(number, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=password", () => {
    const password = document.createElement("input");
    password.type = "password";
    expect(canNodeAcceptInput(password, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=radio", () => {
    const radio = document.createElement("input");
    radio.type = "radio";
    expect(canNodeAcceptInput(radio, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=range", () => {
    const range = document.createElement("input");
    range.type = "range";
    expect(canNodeAcceptInput(range, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=reset", () => {
    const reset = document.createElement("input");
    reset.type = "reset";
    expect(canNodeAcceptInput(reset, "HTMLElement")).toBe(false);
  });
  it("HTMLInputElement type=search", () => {
    const search = document.createElement("input");
    search.type = "search";
    expect(canNodeAcceptInput(search, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=submit", () => {
    const submit = document.createElement("input");
    submit.type = "submit";
    expect(canNodeAcceptInput(submit, "HTMLElement")).toBe(false);
  });
  it("HTMLInputElement type=tel", () => {
    const tel = document.createElement("input");
    tel.type = "tel";
    expect(canNodeAcceptInput(tel, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=text", () => {
    const text = document.createElement("input");
    text.type = "text";
    expect(canNodeAcceptInput(text, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=time", () => {
    const time = document.createElement("input");
    time.type = "time";
    expect(canNodeAcceptInput(time, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=url", () => {
    const url = document.createElement("input");
    url.type = "url";
    expect(canNodeAcceptInput(url, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=week", () => {
    const week = document.createElement("input");
    week.type = "week";
    expect(canNodeAcceptInput(week, "HTMLElement")).toBe(true);
  });
  it("SVGElement ", () => {
    const svgelement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    expect(canNodeAcceptInput(svgelement, "SVGElement")).toBe(false);
  });
  it("Text ", () => {
    const textNode = document.createTextNode("aaa");
    expect(canNodeAcceptInput(textNode, "Text")).toBe(false);
  });
  it("Template ", () => {
    const template = document.createElement("template");
    expect(canNodeAcceptInput(template, "Template")).toBe(false);
  });
});  
