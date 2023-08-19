
# Quelって何？
簡単に使えるJavaScriptフレームワークです。

## 主な特徴
* ルール、作法を少なく
* 宣言的なUIの記述
* 他のライブラリ不要
* トランスパイル不要
* ドット記法によるプロパティ記述

## はじめよう
Quelを使うには、import宣言で、CDNもしくはダウンロードしたファイルから読み込みます。
※import宣言をするので、scriptタグには、`type="module"`が必要です。

CDNの例
```html
<script type="module">
import quel from "https://cdn.jsdelivr.net/gh/mogera551/quel@0.9.7/dist/quel.min.js"; // CDN
</script>
```

ファイルの例
```html
<script type="module">
import quel from "./path/to/quel.min.js"; // ファイル
</script>
```

### 簡単なテスト
`Welcome to Quel`と画面に表示されます。

```html
<!DOCTYPE html>
<html lang="ja">
<meta charset="utf-8">

<myapp-main></myapp-main>

<script type="module">
import quel from "https://cdn.jsdelivr.net/gh/mogera551/quel@0.9.7/dist/quel.min.js"; // CDN

const html = `
<div>{{ message }}</div>
`;

class ViewModel {
  message = "Welcome to Quel";
}

quel.componentModules({ myappMain:{ html, ViewModel } });
</script>
</html>
```


### memo

bundle

```
npx rollup -c
npx rollup -c rollup.config.dev.js
```

