import { FindPropertyCallbackFn } from "../dotNotation/types";
import { Handler } from "./Handler";

type IHandlerPartial = Pick<Handler, "dependentProps">;

export const findPropertyCallback = (handler: IHandlerPartial): FindPropertyCallbackFn => {
  return function(prop:string) : void {
    const dependentProps = handler.dependentProps;
    if (!dependentProps.defaultProps.has(prop)) {
      dependentProps.setDefaultProp(prop);
    }
  }
}