<?php

namespace App\Http\Requests\Admin\Category;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Assuming any authenticated admin user can update categories
        // Add specific authorization logic if needed
        // Example: return $this->user()->can('update', $this->route('category'));
        return $this->user()?->isAdmin() === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        $categoryId = $this->route('category')?->id; // Get category ID from route

        return [
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                'alpha_dash',
                Rule::unique('categories', 'slug')->ignore($categoryId), // Ignore current category
            ],
            'description' => ['nullable', 'string'],
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        // Generate slug from name if slug is not provided or empty
        $name = $this->input('name');
        $slug = $this->input('slug');
        if ($name && !$slug) {
            $this->merge([
                'slug' => Str::slug($name),
            ]);
        }
    }

    /**
     * Get the validated data from the request.
     *
     * @return array
     */
    public function validated($key = null, $default = null)
    {
        $validated = parent::validated();

        // Ensure slug is included if it was generated/merged
        if (!isset($validated['slug']) && $this->has('slug')) {
            $validated['slug'] = $this->input('slug');
        } elseif (empty($validated['slug']) && !empty($validated['name'])) {
            // If validation passed but slug is still empty, generate it
            $validated['slug'] = Str::slug($validated['name']);
        }

        return $validated;
    }
}
