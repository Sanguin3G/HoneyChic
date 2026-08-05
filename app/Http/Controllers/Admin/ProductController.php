<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Product\StoreProductRequest;
use App\Http\Requests\Admin\Product\UpdateProductRequest;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class ProductController extends Controller
{
    /**
     * Display a listing of the products.
     */
    public function index(Request $request)
    {
        $search = $request->input('search');
        $categoryFilter = $request->input('category');
        $statusFilter = $request->input('status');
        $stockStatusFilter = $request->input('stock_status');
        $sortField = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('direction', 'desc');

        $lowStockThreshold = 10;

        $validSortFields = ['created_at', 'name', 'price', 'stock_quantity', 'is_published'];
        if (!in_array($sortField, $validSortFields)) {
            $sortField = 'created_at';
        }
        if (!in_array($sortDirection, ['asc', 'desc'])) {
            $sortDirection = 'desc';
        }

        $products = Product::with('category')
            ->when($search, fn($query) => $query->where('name', 'like', "%{$search}%")
                ->orWhere('sku', 'like', "%{$search}%"))
            ->when($categoryFilter, fn($query) => $query->where('category_id', $categoryFilter))
            ->when($statusFilter !== null && $statusFilter !== '', fn($query) => 
                $query->where('is_published', $statusFilter === 'published'))
            ->when($stockStatusFilter, function ($query) use ($stockStatusFilter, $lowStockThreshold) {
                if ($stockStatusFilter === 'in_stock') {
                    return $query->where('stock_quantity', '>', $lowStockThreshold);
                } elseif ($stockStatusFilter === 'low_stock') {
                    return $query->where('stock_quantity', '>', 0)
                                 ->where('stock_quantity', '<=', $lowStockThreshold);
                } elseif ($stockStatusFilter === 'out_of_stock') {
                    return $query->where('stock_quantity', '<=', 0);
                }
                return $query;
            })
            ->orderBy($sortField, $sortDirection)
            ->paginate(15)
            ->withQueryString();

        // Return JSON for API requests
        if ($request->wantsJson()) {
            return response()->json($products);
        }

        $categories = Category::orderBy('name')->get();
        $stockStatusOptions = [
            '' => 'All Stock Statuses',
            'in_stock' => 'In Stock',
            'low_stock' => 'Low Stock (≤' . $lowStockThreshold . ')',
            'out_of_stock' => 'Out of Stock'
        ];

        return view('admin.products.index', compact(
            'products',
            'categories',
            'search',
            'categoryFilter',
            'statusFilter',
            'stockStatusFilter',
            'stockStatusOptions',
            'lowStockThreshold',
            'sortField',
            'sortDirection'
        ));
    }

    /**
     * Show the form for creating a new product.
     */
    public function create(): View
    {
        $categories = Category::orderBy('name')->get();
        return view('admin.products.form', compact('categories'));
    }

    /**
     * Store a newly created product in storage.
     */
    public function store(StoreProductRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        Product::create($validated);

        return redirect()->route('admin.products.index')
            ->with('status', 'Product created successfully.');
    }

    /**
     * Show the form for editing the specified product.
     */
    public function edit(Product $product): View
    {
        $categories = Category::orderBy('name')->get();
        return view('admin.products.form', compact('product', 'categories'));
    }

    /**
     * Update the specified product in storage.
     */
    public function update(UpdateProductRequest $request, Product $product): RedirectResponse
    {
        $validated = $request->validated();
        $product->update($validated);

        return redirect()->route('admin.products.edit', $product->id)
            ->with('status', 'Product updated successfully.');
    }

    /**
     * Remove the specified product from storage.
     */
    public function destroy(Product $product): RedirectResponse
    {
        if ($product->orderItems()->exists()) {
            return redirect()->route('admin.products.index')
                ->with('error', 'Products used in orders cannot be deleted.');
        }

        $product->delete();

        return redirect()->route('admin.products.index')
            ->with('status', 'Product deleted successfully.');
    }
} 