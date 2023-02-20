import myname from "../myname.js";

export const SYM_GET_INDEXES = Symbol.for(`${myname}:viewModel.indexes`);
export const SYM_GET_TARGET = Symbol.for(`${myname}:viewModel.target`);
export const SYM_CALL_DIRECT_GET = Symbol.for(`${myname}:viewModel.directGet`);
export const SYM_CALL_DIRECT_SET = Symbol.for(`${myname}:viewModel.directSet`);
export const SYM_CALL_DIRECT_CALL = Symbol.for(`${myname}:viewModel.directCall`);
export const SYM_CALL_INIT = Symbol.for(`${myname}:viewModel.init`);
export const SYM_CALL_WRITE = Symbol.for(`${myname}:viewModel.write`);
export const SYM_CALL_CLEAR_CACHE = Symbol.for(`${myname}:viewModel.clearCache`);

export const SYM_GET_IS_PROXY = Symbol.for(`${myname}:arrayHandler.isProxy`);
export const SYM_GET_RAW = Symbol.for(`${myname}:arrayHandler.raw`);
