import "jest";
import { getIsInputable } from "../../src/binder/isInputable";

describe("isInputable", () => {
  it("HTMLInputElement", () => {
    const input = document.createElement("input");
    input.type = "text";
    expect(getIsInputable(input, "HTMLElement")).toBe(true);
  });
  it("HTMLSelectElement", () => {
    const select = document.createElement("select");
    expect(getIsInputable(select, "HTMLElement")).toBe(true);
  });
  it("HTMLTextAreaElement", () => {
    const textarea = document.createElement("textarea");
    expect(getIsInputable(textarea, "HTMLElement")).toBe(true);
  });
  it("HTMLButtonElement", () => {
    const button = document.createElement("button");
    expect(getIsInputable(button, "HTMLElement")).toBe(false);
  });
  it("HTMLInputElement type=button", () => {
    const button = document.createElement("input");
    button.type = "button";
    expect(getIsInputable(button, "HTMLElement")).toBe(false);
  });
  it("HTMLInputElement type=checkbox", () => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    expect(getIsInputable(checkbox, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=color", () => {
    const color = document.createElement("input");
    color.type = "color";
    expect(getIsInputable(color, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=date", () => {
    const date = document.createElement("input");
    date.type = "date";
    expect(getIsInputable(date, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=datetime-local", () => {
    const datetimeLocal = document.createElement("input");
    datetimeLocal.type = "datetime-local";
    expect(getIsInputable(datetimeLocal, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=email", () => {
    const email = document.createElement("input");
    email.type = "email";
    expect(getIsInputable(email, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=file", () => {
    const file = document.createElement("input");
    file.type = "file";
    expect(getIsInputable(file, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=hidden", () => {
    const hidden = document.createElement("input");
    hidden.type = "hidden";
    expect(getIsInputable(hidden, "HTMLElement")).toBe(false);
  });
  it("HTMLInputElement type=image", () => {
    const image = document.createElement("input");
    image.type = "image";
    expect(getIsInputable(image, "HTMLElement")).toBe(false);
  });
  it("HTMLInputElement type=month", () => {
    const month = document.createElement("input");
    month.type = "month";
    expect(getIsInputable(month, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=number", () => {
    const number = document.createElement("input");
    number.type = "number";
    expect(getIsInputable(number, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=password", () => {
    const password = document.createElement("input");
    password.type = "password";
    expect(getIsInputable(password, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=radio", () => {
    const radio = document.createElement("input");
    radio.type = "radio";
    expect(getIsInputable(radio, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=range", () => {
    const range = document.createElement("input");
    range.type = "range";
    expect(getIsInputable(range, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=reset", () => {
    const reset = document.createElement("input");
    reset.type = "reset";
    expect(getIsInputable(reset, "HTMLElement")).toBe(false);
  });
  it("HTMLInputElement type=search", () => {
    const search = document.createElement("input");
    search.type = "search";
    expect(getIsInputable(search, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=submit", () => {
    const submit = document.createElement("input");
    submit.type = "submit";
    expect(getIsInputable(submit, "HTMLElement")).toBe(false);
  });
  it("HTMLInputElement type=tel", () => {
    const tel = document.createElement("input");
    tel.type = "tel";
    expect(getIsInputable(tel, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=text", () => {
    const text = document.createElement("input");
    text.type = "text";
    expect(getIsInputable(text, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=time", () => {
    const time = document.createElement("input");
    time.type = "time";
    expect(getIsInputable(time, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=url", () => {
    const url = document.createElement("input");
    url.type = "url";
    expect(getIsInputable(url, "HTMLElement")).toBe(true);
  });
  it("HTMLInputElement type=week", () => {
    const week = document.createElement("input");
    week.type = "week";
    expect(getIsInputable(week, "HTMLElement")).toBe(true);
  });
  it("SVGElement ", () => {
    const svgelement = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    expect(getIsInputable(svgelement, "SVGElement")).toBe(false);
  });
  it("Text ", () => {
    const textNode = document.createTextNode("aaa");
    expect(getIsInputable(textNode, "Text")).toBe(false);
  });
  it("Template ", () => {
    const template = document.createElement("template");
    expect(getIsInputable(template, "Template")).toBe(false);
  });
});  
