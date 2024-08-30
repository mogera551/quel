import "../nop";

type CaseType = "kebab" | "snake" | "upperCamel" | "lowerCamel" | "dotted";

type CaseTypeNames = {
  [key in CaseType]:string;
}

interface PrefixResult {
  prefixName:string;
  subName:string;
  path:string;
}

type Registrar = (name:string, module:any) => void;