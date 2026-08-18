<?php

namespace App\Livewire\Storefront;

use App\Models\Category;
use App\Models\Product;
use App\Support\CartManager;
use Livewire\Component;

class Home extends Component
{
    public function addToCart(int $productId): void
    {
        app(CartManager::class)->add(Product::findOrFail($productId));
        $this->dispatch('cart-updated');
        session()->flash('success', 'Added to your cart.');
    }

    public function render()
    {
        return view('livewire.storefront.home', [
            'featuredProducts' => Product::query()->with('category')->where('is_published', true)->where('is_featured', true)->latest()->take(4)->get(),
            'latestProducts' => Product::query()->with('category')->where('is_published', true)->latest()->take(8)->get(),
            'categories' => Category::query()->withCount('products')->orderBy('name')->get(),
        ])->layout('components.layouts.app', ['title' => 'Thoughtful things for everyday life']);
    }
}
