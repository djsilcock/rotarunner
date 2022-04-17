import * as z from "zod";

export function numberString() {
  return z.union([
    z.number(),
    z
      .string()
      .refine((input) => !isNaN(parseInt(input)))
      .transform((input) => parseInt(input)),
    z.literal('').transform(()=>undefined)
  ]);
}
