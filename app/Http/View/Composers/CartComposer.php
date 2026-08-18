<?php

namespace App\Http\View\Composers;

use Illuminate\Support\Facades\Session;
use Illuminate\View\View;

class CartComposer
{
    /**
     * Bind data to the view.
     *
     * @param View $view
     * @return void
     */
    public function compose(View $view): void
    {
        $cart = Session::get('cart', []);
        $cartItemCount = collect($cart)->sum(fn ($item) => (int) ($item['quantity'] ?? 0));
        $view->with('cartItemCount', $cartItemCount);
    }
}
