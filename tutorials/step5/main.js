const html = `
<div>{{ message }}</div>
<div>{{ message|substring,4,15|toUpperCase }}</div>

<div>{{ price }}</div>
<div>{{ price|toLocaleString }}</div>
`;

class ViewModel {
  message = "The quick brown fox jumps over the lazy dog";
  price = 19800;
}

export default { html, ViewModel }
