export interface ErrorData {
  status: number;
  error: string;
  message: string;
}

export async function parseError(res: Response): Promise<ErrorData> {
  try {
    const body = await res.json();
    return {
      status: body.status ?? res.status,
      error: body.error ?? res.statusText,
      message: body.message ?? "An unexpected error occurred",
    };
  } catch {
    const text = await res.text().catch(() => "");
    return {
      status: res.status,
      error: res.statusText,
      message: text || "An unexpected error occurred",
    };
  }
}
