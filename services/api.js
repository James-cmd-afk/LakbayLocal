import { Platform } from 'react-native';

const BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ||
  `http://${Platform.OS === 'android' ? '10.0.2.2' : 'localhost'}:5000/api`
).replace(/\/$/, '');

let authToken = null;

export const setToken = (token) => { authToken = token; };
export const getToken = () => authToken;

const request = async (method, path, data = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

  const opts = { method, headers };
  if (data) opts.body = JSON.stringify(data);

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, opts);
  } catch (error) {
    const detail = error instanceof Error ? ` (${error.message})` : '';
    throw new Error(
      `Cannot reach the LakbayLocal API at ${BASE_URL}. ` +
      "Start the backend and set EXPO_PUBLIC_API_URL to your computer's LAN address when using a physical phone." +
      detail
    );
  }
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json;
};

// ── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
  auth: {
    register: (d) => request('POST', '/auth/register', d),
    login:    (d) => request('POST', '/auth/login', d),
    me:       ()  => request('GET',  '/auth/me'),
  },
  destinations: {
    list:          (params) => request('GET', `/destinations?${new URLSearchParams(params)}`),
    get:           (slug)   => request('GET', `/destinations/${slug}`),
    categories:    ()       => request('GET', '/destinations/categories'),
    create:        (d)      => request('POST', '/destinations', d),
    budgetBuilder: (d)      => request('POST', '/destinations/budget-builder', d),
    approve:       (id, status) => request('PATCH', `/destinations/${id}/approve`, { status }),
  },
  favorites: {
    list:   ()    => request('GET',    '/favorites'),
    add:    (id)  => request('POST',   '/favorites', { destination_id: id }),
    remove: (id)  => request('DELETE', `/favorites/${id}`),
  },
  itineraries: {
    list:       ()        => request('GET',    '/itineraries'),
    get:        (id)      => request('GET',    `/itineraries/${id}`),
    create:     (d)       => request('POST',   '/itineraries', d),
    update:     (id, d)   => request('PUT',    `/itineraries/${id}`, d),
    remove:     (id)      => request('DELETE', `/itineraries/${id}`),
    addItem:    (id, d)   => request('POST',   `/itineraries/${id}/items`, d),
    removeItem: (id, iid) => request('DELETE', `/itineraries/${id}/items/${iid}`),
  },
  reviews: {
    create: (d) => request('POST', '/reviews', d),
  },
  admin: {
    stats:       ()       => request('GET',   '/admin/stats'),
    users:       (params) => request('GET',   `/admin/users?${new URLSearchParams(params)}`),
    updateUser:  (id, d)  => request('PATCH', `/admin/users/${id}`, d),
    submissions: ()       => request('GET',   '/admin/submissions'),
  },
};

export default api;
