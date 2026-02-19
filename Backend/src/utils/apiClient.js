// src/utils/apiClient.js
export const api = (token) => {
  return {
    get: (url) => fetch(url, { headers: { Authorization: `Bearer ${token}` } }),
    post: (url, body) => fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
    patch: (url, body) => fetch(url, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(body),
    }),
    del: (url) => fetch(url, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }),
  };
};
