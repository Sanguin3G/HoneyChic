<?php

namespace App\Livewire\Storefront;

use App\Support\CartManager;
use Livewire\Component;

class CartPage extends Component
{
    public function updateQuantity(int $productId, int $quantity): void
    {
        app(CartManager::class)->update($productId, $quantity);
        session()->flash('success', 'Cart updated.');
    }

    public function remove(int $productId): void
    {
        app(CartManager::class)->remove($productId);
        session()->flash('success', 'Item removed from your cart.');
    }

    public function render()
    {
        $cart = app(CartManager::class);

        return view('livewire.storefront.cart-page', [
            'items' => $cart->items(),
            'subtotal' => $cart->subtotal(),
        ])->layout('components.layouts.app', ['title' => 'Your cart']);
    }
}
