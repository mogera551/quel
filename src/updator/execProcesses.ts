import { IProcess } from "../component/types";
import { IStates } from "../state/types";

const execProcess = async (process: IProcess): Promise<void> => Reflect.apply(process.target, process.thisArgument, process.argumentList);

export async function execProcesses(states: IStates, processes: IProcess[]): Promise<void> {
  await states.writable(async () => {
    for(let i = 0; i < processes.length; i++) {
      await execProcess(processes[i]);
    }
  });
}