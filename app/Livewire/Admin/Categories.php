<?php

namespace App\Livewire\Admin;

use App\Models\Category;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Livewire\Component;
use Livewire\WithPagination;

class Categories extends Component
{
    use WithPagination;

    public string $search = '';
    public bool $showForm = false;
    public ?int $editingId = null;
    public string $name = '';
    public string $slug = '';
    public string $description = '';

    protected $queryString = ['search'];

    public function updatedSearch(): void { $this->resetPage(); }
    public function create(): void { $this->resetForm(); $this->showForm = true; }

    public function edit(int $id): void
    {
        $category = Category::findOrFail($id);
        $this->editingId = $category->id;
        $this->name = $category->name;
        $this->slug = $category->slug;
        $this->description = $category->description ?? '';
        $this->showForm = true;
    }

    public function save(): void
    {
        $this->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['nullable', 'string', 'max:120', Rule::unique('categories', 'slug')->ignore($this->editingId)],
            'description' => ['nullable', 'string', 'max:500'],
        ]);
        Category::updateOrCreate(['id' => $this->editingId], ['name' => $this->name, 'slug' => $this->slug ?: Str::slug($this->name), 'description' => $this->description ?: null]);
        $this->showForm = false;
        $this->resetForm();
        session()->flash('success', 'Category saved.');
    }

    public function delete(int $id): void
    {
        $category = Category::findOrFail($id);
        if ($category->products()->exists()) {
            $this->addError('category', 'Move or archive this category’s products before deleting it.');
            return;
        }
        $category->delete();
        session()->flash('success', 'Category deleted.');
    }

    public function resetForm(): void
    {
        $this->reset(['editingId', 'name', 'slug', 'description']);
        $this->resetValidation();
    }

    public function render()
    {
        return view('livewire.admin.categories', [
            'categories' => Category::withCount('products')->when($this->search, fn ($q) => $q->where(fn ($q) => $q->where('name', 'like', "%{$this->search}%")->orWhere('slug', 'like', "%{$this->search}%")))->orderBy('name')->paginate(10),
        ])->layout('components.layouts.admin', ['title' => 'Categories']);
    }
}
