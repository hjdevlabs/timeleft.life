// API client for Supabase REST calls
// Using raw fetch because supabase-js SDK database methods have compatibility issues

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Get storage key for Supabase session
const STORAGE_KEY = `sb-${supabaseUrl?.split('//')[1]?.split('.')[0]}-auth-token`;

function getAccessToken() {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            // Check if token is not expired
            if (parsed.expires_at && parsed.expires_at * 1000 > Date.now()) {
                return parsed.access_token;
            }
        }
    } catch {
        // Ignore parse errors
    }
    return supabaseKey;
}

function getHeaders() {
    const token = getAccessToken();
    return {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${token}`
    };
}

export const api = {
    // GET request with query params
    async get(table, query = '') {
        const headers = getHeaders();
        const response = await fetch(
            `${supabaseUrl}/rest/v1/${table}${query ? `?${query}` : ''}`,
            { headers }
        );
        if (!response.ok) {
            const error = await response.json();
            throw error;
        }
        return response.json();
    },

    // GET single record by ID
    async getById(table, id) {
        const data = await this.get(table, `id=eq.${id}&select=*`);
        return data?.[0] || null;
    },

    // POST (insert)
    async insert(table, data) {
        const headers = getHeaders();
        const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
            method: 'POST',
            headers: { ...headers, 'Prefer': 'return=representation' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw error;
        }
        return response.json();
    },

    // POST with upsert
    async upsert(table, data) {
        const headers = getHeaders();
        const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
                ...headers,
                'Prefer': 'resolution=merge-duplicates,return=representation'
            },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw error;
        }
        return response.json();
    },

    // PATCH (update)
    async update(table, query, data) {
        const headers = getHeaders();
        const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
            method: 'PATCH',
            headers: { ...headers, 'Prefer': 'return=representation' },
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            const error = await response.json();
            throw error;
        }
        return response.json();
    },

    // DELETE
    async delete(table, query) {
        const headers = getHeaders();
        const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${query}`, {
            method: 'DELETE',
            headers
        });
        if (!response.ok) {
            const error = await response.json();
            throw error;
        }
        return response.ok;
    }
};
