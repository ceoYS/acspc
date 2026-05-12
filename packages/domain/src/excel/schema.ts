import { z } from "zod";

export const GenerateExcelInputSchema = z.object({
  project_id: z.uuid(),
  vendor_id: z.uuid(),
});

export type GenerateExcelInput = z.infer<typeof GenerateExcelInputSchema>;
