
/**
 * ユースケース
 * 1. ダイアログを表示する
 *   オブジェクトの取得
 *   htmlの場合
 *     <dialog id="dialog" is="custom-dialog"></dialog>
 *     dialog = document.querySelector("#dialog");
 *   codeの場合
 *     dialog = document.createElement("dialog", { is: "custom-dialog" });
 *     document.body.appendChild(dialog);
 * 
 *  プロパティの設定
 *     dialog.props = { title: "タイトル", message: "メッセージ" };
 *     
 *  ダイアログの表示
 *     dialog.returnValue = "";
 *     dialog.show();
 *     dialog.showModal();
 * 
 *  ダイアログの非表示
 *     dialog.close();
 * 
 *  モーダルのブロック
 *     const resolvers = Promise.withResolvers();
 *     dialog.addEventListener("close", () => {
 *         if (dialog.returnValue === "") {
 *             resolvers.reject();
 *         } else {
 *             resolvers.resolve(dialog.props[Symbols.toObject]);
 *         }
 *     });
 *     await resolvers.promise;
 *
 * 
 * 

* 
 * 2. ダイアログを閉じる
 * 
 */


