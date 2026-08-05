<?php

namespace App\Http\Requests\Admin\Product;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreProductRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Assuming any authenticated admin user can create products
        // Adjust authorization logic if needed (e.g., check permissions)
        return $this->user()?->isAdmin() === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'image_url' => ['nullable', 'url', 'max:2048'], // Renamed from 'image' in original controller validation for clarity
            'category_id' => ['required', 'exists:categories,id'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'is_published' => ['nullable'], // Presence check handled separately
            // 'sku' => ['nullable', 'string', 'unique:products,sku'], // Add if SKU is used and needs to be unique on creation
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        // Automatically generate slug from name if not provided
        $name = request()->input('name');
        $slug = request()->input('slug');
        if ($name && !$slug) {
            request()->merge([ // Use request() helper to merge
                'slug' => Str::slug($name),
            ]);
        }

        // Handle checkbox presence for is_published
        request()->merge([ // Use request() helper to merge
            'is_published' => request()->has('is_published'), // Use request() helper to check presence
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

        return $validated;
    }
}
