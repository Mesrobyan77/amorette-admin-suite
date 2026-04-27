import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email").max(255),
  password: z.string().min(6, "Min 6 characters").max(128),
});
export type LoginInput = z.infer<typeof loginSchema>;
