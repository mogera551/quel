
カスタム要素内にあるボタンを拡張し、invoker commandの機能を入れる

UseInvokeCommandsオプションを使用する

clickイベントの追加
　clickイベントでは、commandイベント（command属性の値を送る）を発行
　commandイベントのあて先は、commandforで示されるDOM
  　commandforの検索順
  　　:hostの場合、shadowroot
  　　先祖DOMにshadowrootを含む場合、shadowroot毎にquerySelector
  　　なければ、documentのquerySelector
commandイベントの追加
　commandイベントでは、commandの値を読み取って実行する
　commandの値はケバブケースなので、スネークケースへ変換し実行する
　commandが--で始まる場合、何もしない
　
DOMツリーのrootからbuttonで