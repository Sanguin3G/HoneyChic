<?php

namespace App\Livewire\Storefront;

use App\Support\CartManager;
use Livewire\Attributes\On;
use Livewire\Component;

class CartIndicator extends Component
{
    #[On('cart-updated')]
    public function refreshCount(): void
    {
        // The render cycle recalculates the count from the session.
    }

    public function render()
    {
        return view('livewire.storefront.cart-indicator', [
            'count' => app(CartManager::class)->count(),
        ]);
    }
}
