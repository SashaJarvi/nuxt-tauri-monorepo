import { createSuccessResponse } from "../../app/utils/api";
import type { HealthResponse } from "../../app/types/api";

export default defineEventHandler(() => {
  const response: HealthResponse = {
    status: "ok",
    timestamp: new Date().toISOString(),
  };
  return createSuccessResponse(response);
});
