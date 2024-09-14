// see: https://zenn.dev/tecsoc/articles/4746ef12e65d79
export type StringKeyToAnyValue = Record<string, any>;
export type HeadProperty<T extends string> = T extends `${infer First}.${string}` ? First : T;
export type TailProperty<T extends string> = T extends `${string}.${infer Rest}` ? Rest : never;

export type DeepPick<T extends StringKeyToAnyValue, U extends string> = {
  [K in HeadProperty<U> & keyof T]: K extends readonly unknown[]
    ? DeepPick<T[K][number], TailProperty<U>>
    : T[K] extends StringKeyToAnyValue
    ? DeepPick<T[K], TailProperty<U>>
    : T[K];
};