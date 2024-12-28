import { IProcess } from "../component/types";
import { AsyncSetWritableSymbol, UpdatedCallbackSymbol } from "../state/symbols";
import { IStatePropertyAccessor, IStateProxy } from "../state/types";
import { IUpdater } from "./types";

async function execProcess (updater: IUpdater, process: IProcess): Promise<void> {
  if (typeof process.loopContext === "undefined") {
    return await updater.namedLoopIndexesStack.asyncSetNamedLoopIndexes({}, async () => {
      return await Reflect.apply(process.target, process.thisArgument, process.argumentList);
    })
  } else {
    return await updater.loopContextStack.setLoopContext(updater.namedLoopIndexesStack, process.loopContext, async () => {
      return await Reflect.apply(process.target, process.thisArgument, process.argumentList);
    });
  }
}

async function _execProcesses(updater:IUpdater, processes: IProcess[]): Promise<IStatePropertyAccessor[]> {
  for(let i = 0; i < processes.length; i++) {
    // Stateのイベント処理を実行する
    // Stateのプロパティに更新があった場合、
    // UpdaterのupdatedStatePropertiesに更新したプロパティの情報（pattern、indexes）が追加される
    await execProcess(updater, processes[i]);
  }
  return updater.retrieveAllUpdatedStateProperties();
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
  const totalUpdatedStateProperties: IStatePropertyAccessor[] = 
    updater.retrieveAllUpdatedStateProperties();
  await state[AsyncSetWritableSymbol](async () => {
    do {
      const processes = updater.retrieveAllProcesses();
      if (processes.length === 0) break;
      const updateStateProperties = await _execProcesses(updater, processes);
      if (updateStateProperties.length > 0) {
        totalUpdatedStateProperties.push(...updateStateProperties);
        enqueueUpdatedCallback(updater, state, updateStateProperties)
      }
    } while(true);
  });
  return totalUpdatedStateProperties;
}
