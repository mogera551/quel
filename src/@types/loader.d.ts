export {}

export type CaseType = "kebab" | "snake" | "upperCamel" | "lowerCamel" | "dotted";

export type CaseTypeNames = {
  [key in CaseType]:string;
}

export interface PrefixResult {
  prefixName:string;
  subName:string;
  path:string;
}

export type Registrar = (name:string, module:any) => void;