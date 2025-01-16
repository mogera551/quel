
export interface ICommandEvent {
  readonly target:  HTMLElement;
  readonly command: string;
  readonly source:  HTMLButtonElement;
}

export type CommandEvent = CustomEventInit<ICommandEvent>;
