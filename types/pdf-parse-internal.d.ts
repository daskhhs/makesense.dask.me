declare module "pdf-parse/lib/pdf-parse.js" {
  import type { Result, Options } from "pdf-parse";

  function PDF(dataBuffer: Buffer, options?: Options): Promise<Result>;
  export default PDF;
}
