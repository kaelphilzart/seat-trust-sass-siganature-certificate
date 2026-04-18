interface RequestOptions<T = any> {
    method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
    body?: T;
    headers?: Record<string, string>;
}
//=========================================================
export const endpoints = {
    users: '/api/v1/user',
    subscription: {
        base: '/api/v1/subscription',
        feature: '/api/v1/subscription/feature',
        plan: '/api/v1/subscription/plan',
        PlanFeature: '/api/v1/subscription/plan-feature-value',
    },
    Organization: {
        base: '/api/v1/organization',
        user: '/api/v1/organization-user',
        asset: '/api/v1/organization/asset',
    },
    template: {
        base: '/api/v1/template',
        detail: '/api/v1/template/detail'
    },
    batch: {
        base: '/api/v1/batch',
        detail: '/api/v1/batch/detail'
    },
    elementType: {
        base : '/api/v1/element-type'
    },
    templatePosition: {
        base : '/api/v1/template-position'
    },
    representative: '/api/v1/representative',
    batchRepresentative: '/api/v1/batch-representative',
    templatePositionBinding: '/api/v1/template-position-binding',
    participant: '/api/v1/participant',
    certificate: {
        base: '/api/v1/certificate/download',
        participant: '/api/v1/certificate/download/participant'
    },
}
//=========================================================

export const request = async <T = unknown, B = unknown>(
    url: string,
    { method = 'GET', body, headers }: RequestOptions<B> = {}
): Promise<T> => {
    const res = await fetch(url, {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    let data: any = null;
    try {
        data = await res.json();
    } catch {
        // kalau response kosong
    }
    if (!res.ok) {
        throw new Error(data?.message || `HTTP Error ${res.status}`);
    }
    return data as T;
};

export const requestFile = async <T = unknown, B = unknown>(
  url: string,
  { method = 'GET', body, headers }: RequestOptions<B> = {}
): Promise<T> => {
  const isFormData = body instanceof FormData;

  const res = await fetch(url, {
    method,
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: isFormData
      ? (body as any)
      : body
      ? JSON.stringify(body)
      : undefined,
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {}

  if (!res.ok) {
    throw new Error(data?.message || `HTTP Error ${res.status}`);
  }

  return data as T;
};

export const fetcher = async <T = any>(url: string, options?: RequestInit): Promise<T> => {
    const res = await fetch(url, options);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData?.message || `HTTP error! status: ${res.status}`);
    }
    return res.json();
};
