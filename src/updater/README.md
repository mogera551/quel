処理

イベント処理(execProcesses)
　Stateを更新→更新したStateプロパティを記録
    

更新したStateプロパティから影響を受けるStateプロパティを取得する(expandStateProperties)

影響を受けるStateプロパティを持つBindingを取得する

そのBindingのうち分岐、ループの場合、Bindingを再構築する
rebuildBinding
  applyToNode

そのBindingのnodeプロパティを更新する
updateNode
  applyToNode



// rebuildBindingの処理



