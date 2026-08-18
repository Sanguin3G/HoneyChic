<?php

namespace App\Livewire\Admin;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;
use Livewire\Component;
use Livewire\WithPagination;

class Products extends Component
{
    use WithPagination;

    public string $search = '';
    public string $category = '';
    public string $status = '';
    public bool $showForm = false;
    public ?int $editingId = null;
    public string $name = '';
    public string $sku = '';
    public string $slug = '';
    public string $description = '';
    public string $price = '';
    public int $stockQuantity = 0;
    public string $categoryId = '';
    public bool $isPublished = true;
    public bool $isFeatured = false;

    protected $queryString = ['search', 'category', 'status'];

    public function updatedSearch(): void { $this->resetPage(); }
    public function updatedCategory(): void { $this->resetPage(); }
    public function updatedStatus(): void { $this->resetPage(); }

    public function create(): void
    {
        $this->resetForm();
        $this->showForm = true;
    }

    public function edit(int $id): void
    {
        $product = Product::findOrFail($id);
        $this->editingId = $product->id;
        $this->name = $product->name;
        $this->sku = $product->sku ?? '';
        $this->slug = $product->slug;
        $this->description = $product->description ?? '';
        $this->price = (string) $product->price;
        $this->stockQuantity = $product->stock_quantity;
        $this->categoryId = (string) ($product->category_id ?? '');
        $this->isPublished = $product->is_published;
        $this->isFeatured = $product->is_featured;
        $this->showForm = true;
    }

    public function save(): void
    {
        $this->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:80', Rule::unique('products', 'sku')->ignore($this->editingId)],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($this->editingId)],
            'description' => ['required', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0'],
            'stockQuantity' => ['required', 'integer', 'min:0'],
            'categoryId' => ['required', 'exists:categories,id'],
        ]);

        Product::updateOrCreate(['id' => $this->editingId], [
            'name' => $this->name,
            'sku' => strtoupper($this->sku),
            'slug' => $this->slug ?: Str::slug($this->name),
            'description' => $this->description,
            'price' => $this->price,
            'stock_quantity' => $this->stockQuantity,
            'category_id' => $this->categoryId,
            'is_published' => $this->isPublished,
            'is_featured' => $this->isFeatured,
        ]);

        $this->showForm = false;
        $this->resetForm();
        session()->flash('success', 'Product saved.');
    }

    public function delete(int $id): void
    {
        $product = Product::findOrFail($id);
        if ($product->orderItems()->exists()) {
            $this->addError('product', 'Products that appear in orders are archived instead of deleted.');
            $product->update(['is_published' => false]);
            return;
        }
        $product->delete();
        session()->flash('success', 'Product archived.');
    }

    public function resetForm(): void
    {
        $this->reset(['editingId', 'name', 'sku', 'slug', 'description', 'price', 'stockQuantity', 'categoryId', 'isFeatured']);
        $this->isPublished = true;
        $this->stockQuantity = 0;
        $this->resetValidation();
    }

    public function render()
    {
        $products = Product::with('category')->when($this->search, fn ($q) => $q->where(fn ($q) => $q->where('name', 'like', "%{$this->search}%")->orWhere('sku', 'like', "%{$this->search}%")))
            ->when($this->category, fn ($q) => $q->where('category_id', $this->category))
            ->when($this->status === 'published', fn ($q) => $q->where('is_published', true))
            ->when($this->status === 'draft', fn ($q) => $q->where('is_published', false))
            ->latest()->paginate(10);

        return view('livewire.admin.products', ['products' => $products, 'categories' => Category::orderBy('name')->get()])->layout('components.layouts.admin', ['title' => 'Products']);
    }
}
