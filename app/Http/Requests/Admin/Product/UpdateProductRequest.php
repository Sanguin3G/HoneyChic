<?php

namespace App\Http\Requests\Admin\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class UpdateProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Assuming any authenticated admin user can update products
        // Add specific authorization logic if needed (e.g., check ownership or permissions)
        // Example: return $this->user()->can('update', $this->route('product'));
        return $this->user()?->isAdmin() === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        $productId = $this->route('product')?->id; // Get product ID from route model binding

        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'image_url' => ['nullable', 'url', 'max:2048'],
            'category_id' => ['required', 'exists:categories,id'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'is_published' => ['nullable'], // Presence check handled separately
            // Example for unique SKU validation on update:
            // 'sku' => [
            //     'nullable',
            //     'string',
            //     Rule::unique('products', 'sku')->ignore($productId),
            // ],
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        // Automatically generate slug from name if name changed and slug not provided explicitly
        $name = request()->input('name');
        $slug = request()->input('slug');
        $currentName = $this->route('product')?->name; // Get current name

        // Only update slug if name changes or slug is empty
        if ($name && $name !== $currentName && !$slug) {
            request()->merge([
                'slug' => Str::slug($name),
            ]);
        } elseif ($name && !$slug && !$this->route('product')?->slug) {
            // If slug was initially empty, generate it
            request()->merge([
                'slug' => Str::slug($name),
            ]);
        }


        // Handle checkbox presence for is_published
        request()->merge([
            'is_published' => request()->has('is_published'),
        ]);
    }

    /**
     * Get the validated data from the request.
     *
     * @return array
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated();

        // Map image_url to image field for the database
        $validated['image'] = $validated['image_url'] ?? null;
        unset($validated['image_url']);

        // Ensure slug is included if it was generated/merged
        if (!isset($validated['slug']) && request()->has('slug')) {
            $validated['slug'] = request()->input('slug');
        }


        return $validated;
    }
}
