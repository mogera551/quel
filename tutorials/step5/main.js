
export const html = `
<div>{{ message }}</div>
<div>{{ message|substring,4,15|toUpperCase }}</div>

<div>{{ price }}</div>
<div>{{ price|s.toLocaleString }}</div>
`;

export class ViewModel {
  message = "The quick brown fox jumps over the lazy dog";
  price = 19800;
}
