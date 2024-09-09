import { IPropertyAccess } from "../binding/types";
import { IProcess } from "../component/types";
import { UpdatedCallbackSymbol } from "../state/symbols";
import { IStates } from "../state/types";
import { IUpdator } from "./types";

const execProcess = async (process: IProcess): Promise<void> => Reflect.apply(process.target, process.thisArgument, process.argumentList);

async function _execProcesses(updator:IUpdator, processes: IProcess[]): Promise<IPropertyAccess[]> {
  for(let i = 0; i < processes.length; i++) {
    // Stateのイベント処理を実行する
    // Stateのプロパティに更新があった場合、
    // UpdatorのupdatedStatePropertiesに更新したプロパティの情報（pattern、indexes）が追加される
    await execProcess(processes[i]);
  }
  return updator.retrieveAllUpdatedStateProperties();
}

function enqueueUpdatedCallback(updator:IUpdator, states: IStates, updatedStateProperties: IPropertyAccess[]): void {
  // Stateの$updatedCallbackを呼び出す、updatedCallbackの実行をキューに入れる
  const updateInfos = updatedStateProperties.map(prop => ({ name:prop.pattern, indexes:prop.indexes }));
  states.current[UpdatedCallbackSymbol](updateInfos);
}

export async function execProcesses(updator:IUpdator, states:IStates): Promise<IPropertyAccess[]> {
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
