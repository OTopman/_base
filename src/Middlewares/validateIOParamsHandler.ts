import { AppError } from "@/Helpers/AppError";
import { inputValidation } from "@/Helpers/util";

/**
 * Check if the required fields are present
 * @param {Array | string} props - Array or comma separated list of required fields
 * @return {function}
 */
export default function validateIOParamsHandler(props: string | string[]) {
  if (typeof props === "string") {
    props = props.replace(/\s/g, "").split(",");
  }
  props = props instanceof Array ? props : [props];

  return (param: any) => {
    let message = "(";
    for (let i = 0; i < props.length; i++) {
      let propNotExists = true;
      for (const key in param) {
        propNotExists = !param[props[i]];

        if (param[key] && typeof param[key] !== "object") {
          param[key] = inputValidation(param[key]);
        }
      }
      if (propNotExists) {
        message += props[i] + ", ";
      }
    }
    if (message !== "(") {
      throw new AppError(
        `These fields are required: ${message.slice(0, -2)})`,
        400
      );
    }
  };
}
