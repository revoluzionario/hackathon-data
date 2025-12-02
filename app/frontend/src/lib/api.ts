const DEFAULT_REVALIDATE = 60;

export type ApiFetchOptions = RequestInit & {
  revalidate?: number;
  tags?: string[];
};

const baseUrl = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

export function buildUrl(path: string) {
  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return `${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
  }
}

export async function fetchFromApi<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  const { revalidate, tags, headers, ...rest } = options ?? {};
  const nextConfig = typeof revalidate === 'number' || tags?.length
    ? { revalidate: revalidate ?? DEFAULT_REVALIDATE, tags }
    : { revalidate: DEFAULT_REVALIDATE };

  const response = await fetch(buildUrl(path), {
    ...rest,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(headers ?? {}),
    },
    next: nextConfig,
  });

  if (!response.ok) {
    throw new Error(`API request failed (${response.status}) for ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function safeFetchFromApi<T>(path: string, options?: ApiFetchOptions, fallback?: T): Promise<T> {
  try {
    return await fetchFromApi<T>(path, options);
  } catch (error) {
    console.warn(`Failed to fetch ${path}:`, error);
    if (fallback !== undefined) {
      return fallback;
    }
    throw error;
  }
}

type ApiMutationBody = BodyInit | null | Record<string, unknown> | Array<unknown> | undefined;

export type ApiMutateOptions = Omit<RequestInit, 'body'> & {
  body?: ApiMutationBody;
  skipJson?: boolean;
};

export async function mutateApi<T = unknown>(path: string, options?: ApiMutateOptions): Promise<T | undefined> {
  const { headers, body, skipJson, ...rest } = options ?? {};
  const baseHeaders: Record<string, string> = {
    Accept: 'application/json',
  };
  if (!(body instanceof FormData)) {
    baseHeaders['Content-Type'] = 'application/json';
  }
  const response = await fetch(buildUrl(path), {
    method: rest.method ?? 'POST',
    cache: 'no-store',
    credentials: 'include',
    headers: {
      ...baseHeaders,
      ...(headers ?? {}),
    },
    body: body instanceof FormData || typeof body === 'string' ? body : body != null ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!response.ok) {
    throw new Error(`API mutation failed (${response.status}) for ${path}`);
  }

  if (skipJson || response.status === 204) {
    return undefined;
  }

  return (await response.json()) as T;
}

export async function postToApi<TResponse = unknown>(
  path: string,
  body?: ApiMutationBody,
  options?: ApiMutateOptions,
): Promise<TResponse | undefined> {
  return mutateApi<TResponse>(path, { ...options, method: 'POST', body });
}
