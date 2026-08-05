import Alpine from 'alpinejs';

const csrfToken = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

async function request(url, method, body = null) {
    const response = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: {
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken(),
            ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
    });

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        throw new Error(data?.message || 'Cart update failed.');
    }

    return data;
}

Alpine.data('cartPage', (initialItems = []) => ({
    items: initialItems,
    busy: false,

    async change(item, delta) {
        if (this.busy) return;

        if (item.quantity + delta < 1) {
            return this.remove(item);
        }

        this.busy = true;
        try {
            await request('/cart/update/' + item.product_id, 'PATCH', {
                quantity: item.quantity + delta,
            });
            item.quantity += delta;
        } catch (error) {
            console.error(error);
            window.location.reload();
        } finally {
            this.busy = false;
        }
    },

    async remove(item) {
        if (this.busy) return;

        this.busy = true;
        try {
            await request('/cart/remove/' + item.product_id, 'DELETE');
            this.items = this.items.filter((cartItem) => cartItem.product_id !== item.product_id);
        } catch (error) {
            console.error(error);
            window.location.reload();
        } finally {
            this.busy = false;
        }
    },
}));