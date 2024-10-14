import { IProcess } from "../component/types";
import { UpdatedCallbackSymbol } from "../state/symbols";
import { IStatePropertyAccessor, IStates } from "../state/types";
import { IUpdator } from "./types";

async function execProcess (updator: IUpdator, process: IProcess): Promise<void> {
  if (typeof process.loopContext === "undefined") {
    return Reflect.apply(process.target, process.thisArgument, process.argumentList);
  } else {
    updator.loopContextStack.setLoopContext(updator.namedLoopIndexesStack, process.loopContext, async (): Promise<void> => {
      return Reflect.apply(process.target, process.thisArgument, process.argumentList);
    });
  }
}

async function _execProcesses(updator:IUpdator, processes: IProcess[]): Promise<IStatePropertyAccessor[]> {
  for(let i = 0; i < processes.length; i++) {
    // Stateのイベント処理を実行する
    // Stateのプロパティに更新があった場合、
    // UpdatorのupdatedStatePropertiesに更新したプロパティの情報（pattern、indexes）が追加される
    await execProcess(updator, processes[i]);
  }
  return updator.retrieveAllUpdatedStateProperties();
}

function enqueueUpdatedCallback(updator:IUpdator, states: IStates, updatedStateProperties: IStatePropertyAccessor[]): void {
  // Stateの$updatedCallbackを呼び出す、updatedCallbackの実行をキューに入れる
  const updateInfos = updatedStateProperties.map(prop => ({ name:prop.pattern, indexes:prop.loopIndexes?.values }));
  updator.addProcess(async () => {
    await states.current[UpdatedCallbackSymbol](updateInfos);
  }, undefined, [], undefined);
}

export async function execProcesses(
  updator: IUpdator, 
  states: IStates
): Promise<IStatePropertyAccessor[]> {
  const totalUpdatedStateProperties: IStatePropertyAccessor[] = [];
  await states.writable(async () => {
    do {
      const processes = updator.retrieveAllProcesses();
      if (processes.length === 0) break;
      const updateStateProperties = await _execProcesses(updator, processes);
      if (updateStateProperties.length > 0) {
        totalUpdatedStateProperties.push(...updateStateProperties);
        enqueueUpdatedCallback(updator, states, updateStateProperties)
      }
    } while(true);
  });
  return totalUpdatedStateProperties;
}
