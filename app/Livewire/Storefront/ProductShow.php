<?php

namespace App\Livewire\Storefront;

use App\Models\Product;
use App\Support\CartManager;
use Livewire\Component;

class ProductShow extends Component
{
    public Product $product;
    public int $quantity = 1;

    public function mount(Product $product): void
    {
        abort_unless($product->is_published, 404);
        $this->product = $product->load('category');
    }

    public function addToCart(): void
    {
        app(CartManager::class)->add($this->product, $this->quantity);
        session()->flash('success', "{$this->product->name} was added to your cart.");
    }

    public function decrementQuantity(): void
    {
        $this->quantity = max(1, $this->quantity - 1);
    }

    public function incrementQuantity(): void
    {
        $this->quantity = min(max(1, $this->product->stock_quantity), $this->quantity + 1);
    }

    public function render()
    {
        return view('livewire.storefront.product-show', [
            'reviews' => $this->product->reviews()->where('status', 'approved')->with('user')->latest()->get(),
            'relatedProducts' => Product::query()->where('category_id', $this->product->category_id)->where('id', '!=', $this->product->id)->where('is_published', true)->take(4)->get(),
        ])->layout('components.layouts.app', ['title' => $this->product->name]);
    }
}
