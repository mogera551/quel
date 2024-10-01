import { IPropertyAccess } from "../binding/types";
import { IProcess } from "../component/types";
import { UpdatedCallbackSymbol } from "../state/symbols";
import { IStates } from "../state/types";
import { IUpdator } from "./types";

async function execProcess (updator: IUpdator, process: IProcess): Promise<void> {
  updator.setLoopContext(process.loopContext, async (): Promise<void> => {
    return Reflect.apply(process.target, process.thisArgument, process.argumentList);
  });

}

async function _execProcesses(updator:IUpdator, processes: IProcess[]): Promise<IPropertyAccess[]> {
  for(let i = 0; i < processes.length; i++) {
    // Stateのイベント処理を実行する
    // Stateのプロパティに更新があった場合、
    // UpdatorのupdatedStatePropertiesに更新したプロパティの情報（pattern、indexes）が追加される
    await execProcess(updator, processes[i]);
  }
  return updator.retrieveAllUpdatedStateProperties();
}

function enqueueUpdatedCallback(updator:IUpdator, states: IStates, updatedStateProperties: IPropertyAccess[]): void {
  // Stateの$updatedCallbackを呼び出す、updatedCallbackの実行をキューに入れる
  const updateInfos = updatedStateProperties.map(prop => ({ name:prop.pattern, indexes:prop.indexes }));
  updator.addProcess(async () => {
    await states.current[UpdatedCallbackSymbol](updateInfos);
  }, undefined, [], undefined);
}

export async function execProcesses(
  updator: IUpdator, 
  states: IStates
): Promise<IPropertyAccess[]> {
  const totalUpdatedStateProperties: IPropertyAccess[] = [];
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
