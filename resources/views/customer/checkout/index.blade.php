<x-layouts.app>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Checkout') }}
        </h2>
    </x-slot>

    <div class="py-12">
        <div class="max-w-6xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-900 shadow-xl sm:rounded-lg">
                <div x-data="checkoutPage(@js(array_values($cart)))" class="md:grid md:grid-cols-10 md:gap-x-12 p-6 sm:p-8">
                    <div class="md:col-span-6">
                        <form id="checkout-form" method="POST" action="{{ route('checkout.process') }}" class="space-y-10">
                            @csrf
                            {{-- Contact Information Section --}}
                            <section aria-labelledby="contact-info-heading">
                                <h3 id="contact-info-heading" class="text-xl font-semibold text-gray-900 dark:text-white mb-5 border-b border-gray-200 dark:border-gray-700 pb-3">Contact Information</h3>
                                <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                    <div class="sm:col-span-2">
                                        <x-input type="text" name="name" id="name" label="Full Name" x-model="form.name" required />
                                    </div>
                                    <div>
                                        <x-input type="email" name="email" id="email" label="Email Address" x-model="form.email" required />
                                    </div>
                                    <div>
                                        <x-input type="tel" name="phone" id="phone" label="Phone Number" x-model="form.phone" required />
                                    </div>
                                </div>
                            </section>

                            {{-- Shipping Address Section --}}
                            <section aria-labelledby="shipping-address-heading">
                                <h3 id="shipping-address-heading" class="text-xl font-semibold text-gray-900 dark:text-white mb-5 border-b border-gray-200 dark:border-gray-700 pb-3">Shipping Address</h3>
                                <div class="space-y-5">
                                    <div>
                                        <x-textarea name="shipping_address" id="shipping_address" label="Full Shipping Address" rows="4" x-model="form.shipping_address" required />
                                    </div>
                                </div>
                            </section>

                            {{-- Billing Address Section --}}
                            <section aria-labelledby="billing-address-heading">
                                <h3 id="billing-address-heading" class="text-xl font-semibold text-gray-900 dark:text-white mb-5 border-b border-gray-200 dark:border-gray-700 pb-3">Billing Address</h3>
                                <div class="space-y-5">
                                    <div>
                                        <div class="flex items-center">
                                            <input type="checkbox" id="same-as-shipping-checkbox" x-model="form.sameAsShipping" class="h-4 w-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 dark:border-gray-600 dark:bg-gray-700 dark:focus:ring-orange-600 dark:focus:ring-offset-gray-800">
                                            <label for="same-as-shipping-checkbox" class="ml-2 block text-sm text-gray-900 dark:text-gray-300">My billing address is the same as my shipping address.</label>
                                        </div>
                                    </div>
                                    <div x-show="!form.sameAsShipping">
                                        <x-textarea name="billing_address" id="billing_address" label="Full Billing Address" rows="4" x-model="form.billing_address" x-bind:required="!form.sameAsShipping" />
                                    </div>
                                </div>
                            </section>

                            {{-- Payment and Options Section --}}
                            <section aria-labelledby="payment-options-heading">
                                <h3 id="payment-options-heading" class="text-xl font-semibold text-gray-900 dark:text-white mb-5 border-b border-gray-200 dark:border-gray-700 pb-3">Payment & Options</h3>
                                <div class="space-y-5">
                                    <div>
                                        <x-input type="text" name="payment_method" id="payment_method" label="Payment Method" x-model="form.payment_method" required />
                                        <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">Currently, we only support Cash on Delivery.</p>
                                    </div>
                                    <div>
                                        <x-textarea name="notes" id="notes" label="Order Notes (Optional)" rows="3" x-model="form.notes" />
                                    </div>
                                    <div class="mt-4">
                                        <x-checkbox name="receive_email_confirmation" id="receive_email_confirmation" label="Receive email updates for this order" x-model="form.receive_email_confirmation" />
                                    </div>
                                </div>
                            </section>

                            <div class="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
                                <x-button type="submit" variant="primary" class="px-8 py-3">
                                    Complete Checkout
                                </x-button>
                            </div>
                        </form>
                    </div>

                    {{-- Order Summary Section (Sidebar-like) --}}
                    <div class="md:col-span-4 mt-12 md:mt-0">
                        <div class="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-md">
                            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-5 border-b border-gray-200 dark:border-gray-700 pb-3">Order Summary</h3>
                            <template x-if="items.length > 0">
                                <div class="space-y-4">
                                    <template x-for="item in items" :key="item.product_id">
                                        <div class="flex justify-between items-start">
                                            <img :src="item.image || 'https://via.placeholder.com/48'" alt="" class="w-12 h-12 object-cover rounded mr-3 flex-shrink-0">
                                            <div class="flex-grow pr-2 min-w-0">
                                                <p class="font-medium text-gray-800 dark:text-gray-200 leading-tight break-words" x-text="item.name"></p>
                                                <p class="text-xs text-gray-500 dark:text-gray-400" x-text="`Qty: ${item.quantity} @ $${item.price.toFixed(2)}`"></p>
                                            </div>
                                            <span class="font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap" x-text="`$${(item.price * item.quantity).toFixed(2)}`"></span>
                                        </div>
                                    </template>
                                </div>
                                <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <div class="flex justify-between items-center text-base font-semibold text-gray-900 dark:text-white">
                                        <span>Order Total</span>
                                        <span x-text="`$${items.reduce((acc, i) => acc + i.price * i.quantity, 0).toFixed(2)}`"></span>
                                    </div>
                                </div>
                            </template>
                            <template x-if="items.length === 0">
                                <p class="text-gray-500 dark:text-gray-400">Your cart is currently empty.</p>
                                <div class="mt-6">
                                    <x-link href="{{ route('products.index') }}" class="w-full">Continue Shopping</x-link>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</x-layouts.app>