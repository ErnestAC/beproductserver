// Auth helper for attaching token to requests
export const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem("token");
    
        const headers = {
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
        };
    
        return fetch(url, {
        ...options,
        headers,
        });
};
