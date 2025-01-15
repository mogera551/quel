import { CommandEvent } from "./types";

export function eventListenerForCommand(event: CommandEvent): void {
  const target = event.detail?.target ?? null;
  if (target == null) {
    return;
  }
  const command = event.detail?.command ?? null;
  if (command == null) {
    return;
  }
  const upperCamelCommand = command.split("-").map((text, index) => {
    if (typeof text[0] !== "undefined") {
      text = text[0].toUpperCase() + text.slice(1);
    }
    return text;
  }).join("");
  const lowerCamelCommand = (upperCamelCommand.length > 0) ? upperCamelCommand[0].toLowerCase() + upperCamelCommand.slice(1) : upperCamelCommand;
  if (Reflect.has(target, lowerCamelCommand)) {
    const commandFn = Reflect.get(target, lowerCamelCommand);
    Reflect.apply(commandFn, target, []);
  }
}