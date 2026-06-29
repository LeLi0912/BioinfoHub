const PREFIX = "[BioinfoHub]";

export const logger = {
  apiRequest: (method: string, url: string, params?: unknown) =>
    console.log(`${PREFIX} API 请求: ${method} ${url}`, params ?? ""),

  apiResponse: (url: string, status: number, meta?: string) =>
    console.log(`${PREFIX} API 响应: ${status}, ${url}, ${meta ?? ""}`),

  apiError: (url: string, status: number, message: string) =>
    console.error(`${PREFIX} API 错误: ${url}, status=${status}, message=${message}`),

  action: (msg: string) =>
    console.log(`${PREFIX} ${msg}`),

  warn: (msg: string) =>
    console.warn(`${PREFIX} ${msg}`),
};
