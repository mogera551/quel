
const nameValue = new URL(import.meta.url).searchParams.get("name");
let _text;
if (nameValue != null) {
  const response = await fetch(import.meta.resolve(nameValue));
  _text = await response.text();
}
export const text = _text;
