<x-layouts.app>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">
            {{ __('Shopping Cart') }}
        </h2>
    </x-slot>

    <div x-data="cartPage(@js(array_values($cart)))" class="py-12">
        <div class="max-w-4xl mx-auto sm:px-6 lg:px-8">
            <div class="bg-white dark:bg-gray-800 shadow-xl sm:rounded-lg">
                <template x-if="items.length > 0">
                    <div class="p-6">
                        <h3 class="text-lg font-medium text-gray-900 dark:text-white mb-4">Cart Items</h3>
                        <div class="space-y-4">
                            <template x-for="item in items" :key="item.product_id">
                                <div class="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                                    <div class="flex items-center gap-4">
                                        <img :src="item.image || 'https://via.placeholder.com/64'" alt="" class="w-16 h-16 object-cover rounded">
                                        <div>
                                            <h4 class="font-semibold text-gray-800 dark:text-gray-200" x-text="item.name"></h4>
                                            <p class="text-sm text-gray-600 dark:text-gray-400" x-text="`Price: $${item.price.toFixed(2)}`"></p>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-4">
                                        <div class="flex items-center border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
                                            <button type="button" @click="change(item, -1)" class="px-2 py-1">
                                                <x-icon name="minus" class="w-4 h-4"/>
                                            </button>
                                            <input type="text" x-model="item.quantity" class="w-10 text-center" readonly>
                                            <button type="button" @click="change(item, 1)" class="px-2 py-1">
                                                <x-icon name="plus" class="w-4 h-4"/>
                                            </button>
                                        </div>
                                        <div class="text-right w-24">
                                            <p class="font-semibold text-gray-800 dark:text-gray-200" x-text="`Subtotal: $${(item.price * item.quantity).toFixed(2)}`"></p>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>
                        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div class="flex justify-between items-center mb-6">
                                <h4 class="text-xl font-semibold text-gray-900 dark:text-white">Order Total:</h4>
                                <p class="text-2xl font-bold text-orange-600 dark:text-orange-400" x-text="`$${items.reduce((acc, i) => acc + i.price * i.quantity, 0).toFixed(2)}`"></p>
                            </div>
                            <div class="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
                                <x-button :href="`/products`" variant="outline" class="w-full sm:w-auto order-last sm:order-first">
                                    <x-icon name="arrow-left" class="mr-2"/> Continue Shopping
                                </x-button>
                                <x-button :href="`/checkout`" variant="primary" class="w-full sm:w-auto bg-gradient-to-r from-orange-500 via-pink-500 to-purple-600">
                                    Proceed to Checkout <x-icon name="arrow-right" class="ml-2"/>
                                </x-button>
                            </div>
                        </div>
                    </div>
                </template>
                <template x-if="items.length === 0">
                    <div class="p-6 text-center">
                        <p class="text-gray-600 dark:text-gray-400 text-lg">Your cart is empty.</p>
                        <a href="{{ route('products.index') }}" class="mt-4 inline-block px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700">
                            Continue Shopping
                        </a>
                    </div>
                </template>
            </div>
        </div>
    </div>
</x-layouts.app>