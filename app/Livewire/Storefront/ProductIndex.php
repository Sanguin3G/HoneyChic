<?php

namespace App\Livewire\Storefront;

use App\Models\Category;
use App\Models\Product;
use App\Support\CartManager;
use Livewire\Component;
use Livewire\WithPagination;

class ProductIndex extends Component
{
    use WithPagination;

    public string $search = '';
    public string $category = '';
    public string $sort = 'featured';
    public string $availability = '';

    protected $queryString = ['search', 'category', 'sort', 'availability'];

    public function updatedSearch(): void { $this->resetPage(); }
    public function updatedCategory(): void { $this->resetPage(); }
    public function updatedSort(): void { $this->resetPage(); }
    public function updatedAvailability(): void { $this->resetPage(); }

    public function clearFilters(): void
    {
        $this->reset(['search', 'category', 'sort', 'availability']);
        $this->resetPage();
    }

    public function addToCart(int $productId): void
    {
        app(CartManager::class)->add(Product::findOrFail($productId));
        session()->flash('success', 'Added to your cart.');
    }

    public function render()
    {
        $query = Product::query()->with('category')->where('is_published', true)
            ->when($this->search, fn ($query) => $query->where(fn ($q) => $q->where('name', 'like', "%{$this->search}%")->orWhere('description', 'like', "%{$this->search}%")))
            ->when($this->category, fn ($query) => $query->whereHas('category', fn ($q) => $q->where('slug', $this->category)))
            ->when($this->availability === 'in_stock', fn ($query) => $query->where('stock_quantity', '>', 0));

        match ($this->sort) {
            'price_low' => $query->orderBy('price')->orderBy('name'),
            'price_high' => $query->orderByDesc('price')->orderBy('name'),
            'newest' => $query->latest(),
            default => $query->orderByDesc('is_featured')->latest(),
        };

        return view('livewire.storefront.product-index', [
            'products' => $query->paginate(12),
            'categories' => Category::query()->orderBy('name')->get(),
        ])->layout('components.layouts.app', ['title' => 'Shop all products']);
    }
}
