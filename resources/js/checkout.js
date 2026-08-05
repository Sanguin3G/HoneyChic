import Alpine from 'alpinejs';

Alpine.data('checkoutPage', (initialItems = []) => ({
    items: initialItems,
    form: {
        name: '',
        email: '',
        phone: '',
        shipping_address: '',
        billing_address: '',
        sameAsShipping: false,
        payment_method: 'Cash on Delivery',
        notes: '',
        receive_email_confirmation: false,
    },
}));