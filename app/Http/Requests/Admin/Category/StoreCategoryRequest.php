<?php

namespace App\Http\Requests\Admin\Category;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;

class StoreCategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Assuming any authenticated admin user can create categories
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
            // Slug is optional on input, will be generated if empty.
            // Unique check ensures no duplicate slugs are submitted.
            'slug' => ['nullable', 'string', 'max:255', 'alpha_dash', 'unique:categories,slug'],
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
        if ($this->name && !$this->slug) {
            $this->merge([
                'slug' => Str::slug($this->name),
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
            // If validation passed but slug is still empty (e.g., only name provided), generate it
            $validated['slug'] = Str::slug($validated['name']);
        }

        return $validated;
    }
}
