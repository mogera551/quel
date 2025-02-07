import { IProcess } from "../component/types";
import { AsyncSetWritableSymbol, UpdatedCallbackSymbol } from "../state/symbols";
import { IStatePropertyAccessor, IStateProxy } from "../state/types";
import { IUpdater } from "./types";

async function execProcess (updater: IUpdater, process: IProcess): Promise<void> {
  if (typeof process.loopContext === "undefined") {
//    console.log(`execProcess.1 ${updater.component.tagName} in`);
    try {
      return await updater.namedLoopIndexesStack.asyncSetNamedLoopIndexes({}, async () => {
        return await Reflect.apply(process.target, process.thisArgument, process.argumentList);
      })
    } finally {
//      console.log(`execProcess.1 ${updater.component.tagName} out`);
    }
  } else {
//    console.log(`execProcess.2 ${updater.component.tagName} in`);
    try {
      return await updater.loopContextStack.setLoopContext(updater.namedLoopIndexesStack, process.loopContext, async () => {
        return await Reflect.apply(process.target, process.thisArgument, process.argumentList);
      });
    } finally {
//      console.log(`execProcess.2 ${updater.component.tagName} out`);
    }
  }
}

async function _execProcesses(updater:IUpdater, processes: IProcess[]): Promise<IStatePropertyAccessor[]> {
  const promises = [];
  for(let i = 0; i < processes.length; i++) {
    // Stateのイベント処理を実行する
    // Stateのプロパティに更新があった場合、
    // UpdaterのupdatedStatePropertiesに更新したプロパティの情報（pattern、indexes）が追加される
    promises.push(execProcess(updater, processes[i]));
  }
  return await Promise.all(promises).then(() => {
    return updater.retrieveAllUpdatedStateProperties();
  });
}

function enqueueUpdatedCallback(updater:IUpdater, state: IStateProxy, updatedStateProperties: IStatePropertyAccessor[]): void {
  // Stateの$updatedCallbackを呼び出す、updatedCallbackの実行をキューに入れる
  const updateInfos = updatedStateProperties.map(prop => ({ name:prop.pattern, indexes:prop.loopIndexes?.values }));
  updater.addProcess(async () => {
    await state[UpdatedCallbackSymbol](updateInfos);
  }, undefined, [], undefined);
}

export async function execProcesses(
  updater: IUpdater, 
  state: IStateProxy
): Promise<IStatePropertyAccessor[]> {
  updater.stacks.push(`execProcesses in`);
  try {
    const totalUpdatedStateProperties: IStatePropertyAccessor[] = 
      updater.retrieveAllUpdatedStateProperties();
    const asyncSetWritable = state[AsyncSetWritableSymbol];
    return await asyncSetWritable(updater, async () => {
      updater.stacks.push(`AsyncSetWritableSymbol callback in`);
      try {
        const promises = [];
        do {
          const processes = updater.retrieveAllProcesses();
          if (processes.length === 0) break;
          const promise = _execProcesses(updater, processes).then((updateStateProperties) => {
            if (updateStateProperties.length > 0) {
              totalUpdatedStateProperties.push(...updateStateProperties);
              enqueueUpdatedCallback(updater, state, updateStateProperties)
            }
          });
          promises.push(promise);
        } while(true);
        return await Promise.all(promises);
      } finally {
        updater.stacks.push(`AsyncSetWritableSymbol callback out`);
      }
    }).then(() => {
      return totalUpdatedStateProperties;
    });
  } finally {
    updater.stacks.push(`execProcesses out`);
  }
}
