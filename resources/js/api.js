// Vanilla JS API methods for Laravel resource endpoints

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await (response.clone().json().catch(() => null));
    const error = new Error(errorData?.message || 'API request failed');
    error.response = response;
    error.data = errorData;
    throw error;
  }
  return response.json();
}

// Categories
export async function getCategories(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/admin/categories?${query}`, {
    headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
  });
  return handleResponse(response);
}

export async function getCategory(id) {
  const response = await fetch(`/admin/categories/${id}`, {
    headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
  });
  return handleResponse(response);
}

export async function createCategory(data) {
  const response = await fetch(`/admin/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateCategory(id, data) {
  const response = await fetch(`/admin/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteCategory(id) {
  const response = await fetch(`/admin/categories/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
  });
  return handleResponse(response);
}

export async function restoreCategory(id) {
  const response = await fetch(`/admin/categories/${id}/restore`, {
    method: 'PUT',
    headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
  });
  return handleResponse(response);
}

// Products
export async function getProducts(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/admin/products?${query}`, {
    headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
  });
  return handleResponse(response);
}

export async function getProduct(id) {
  const response = await fetch(`/admin/products/${id}`, {
    headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
  });
  return handleResponse(response);
}

export async function createProduct(data) {
  const response = await fetch(`/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateProduct(id, data) {
  const response = await fetch(`/admin/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteProduct(id) {
  const response = await fetch(`/admin/products/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
  });
  return handleResponse(response);
}

export async function restoreProduct(id) {
  const response = await fetch(`/admin/products/${id}/restore`, {
    method: 'PUT',
    headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
  });
  return handleResponse(response);
}

// Users
export async function getUsers(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/admin/users?${query}`, {
    headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
  });
  return handleResponse(response);
}

export async function getUser(id) {
  const response = await fetch(`/admin/users/${id}`, {
    headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
  });
  return handleResponse(response);
}

export async function createUser(data) {
  const response = await fetch(`/admin/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateUser(id, data) {
  const response = await fetch(`/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteUser(id) {
  const response = await fetch(`/admin/users/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
  });
  return handleResponse(response);
}

// Orders
export async function getOrders(params = {}) {
  const query = new URLSearchParams(params).toString();
  const response = await fetch(`/admin/orders?${query}`, {
    headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
  });
  return handleResponse(response);
}

export async function getOrder(id) {
  const response = await fetch(`/admin/orders/${id}`, {
    headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
  });
  return handleResponse(response);
}

export async function createOrder(data) {
  const response = await fetch(`/admin/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function updateOrder(id, data) {
  const response = await fetch(`/admin/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
}

export async function deleteOrder(id) {
  const response = await fetch(`/admin/orders/${id}`, {
    method: 'DELETE',
    headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
  });
  return handleResponse(response);
}

export async function restoreOrder(id) {
  const response = await fetch(`/admin/orders/${id}/restore`, {
    method: 'PUT',
    headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
  });
  return handleResponse(response);
}

// Cart
export async function getCart() {
  const response = await fetch(`/cart`, {
    headers: { 'Accept': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
  });
  return handleResponse(response);
}

export async function addToCart(productId, quantity = 1) {
  const response = await fetch(`/cart/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ product_id: productId, quantity }),
  });
  return handleResponse(response);
}

export async function removeFromCart(productId) {
  const response = await fetch(`/cart/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ product_id: productId }),
  });
  return handleResponse(response);
}

// Checkout
export async function checkout(data) {
  const response = await fetch(`/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(response);
} 