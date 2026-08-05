<?php

namespace App\Http\Requests\Admin\User;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

class UpdateUserRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Assuming any authenticated admin user can update users
        // Add specific authorization logic if needed (e.g., prevent non-admins from changing roles)
        // Example: return $this->user()->can('update', $this->route('user'));
        return $this->user()?->isAdmin() === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        $userId = $this->route('user')?->id; // Get user ID from route

        return [
            'name' => ['required', 'string', 'max:255'],
            // Ensure email is unique among non-deleted users, ignoring the current user
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($userId)->whereNull('deleted_at')],
            // Password is optional on update
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'role' => ['required', 'string', Rule::in(['admin', 'customer'])],
        ];
    }

    /**
     * Prepare the data for validation.
     *
     * @return void
     */
    protected function prepareForValidation(): void
    {
        // Remove password field if it's empty, so validation passes
        // and we don't try to hash an empty string later.
        if (empty($this->input('password'))) { // Check input directly
            request()->request->remove('password'); // Use request() helper's request property
            request()->request->remove('password_confirmation'); // Use request() helper's request property
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

        // Hash the password only if it was provided and validated
        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            // Ensure password is not included in the final array if it wasn't provided
            unset($validated['password']);
        }

        return $validated;
    }
}
