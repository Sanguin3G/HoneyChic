<?php

namespace App\Http\Requests\Admin\Order;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateOrderStatusRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        // Assuming any authenticated admin user can update order statuses
        // Add specific authorization logic if needed (e.g., check permissions)
        // Example: return $this->user()->can('updateStatus', $this->route('order'));
        return $this->user()?->isAdmin() === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array|string>
     */
    public function rules(): array
    {
        // Define possible statuses, ideally from a config or Enum in a real app
        $statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];

        return [
            'status' => ['required', 'string', Rule::in($statuses)],
        ];
    }
}
