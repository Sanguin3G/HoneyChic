<?php

namespace App\Livewire\Account;

use App\Models\Order;
use Livewire\Component;
use Livewire\WithPagination;

class OrderIndex extends Component
{
    use WithPagination;

    public string $status = '';
    protected $queryString = ['status'];

    public function updatedStatus(): void { $this->resetPage(); }

    public function render()
    {
        return view('livewire.account.order-index', [
            'orders' => Order::query()->where('user_id', auth()->id())->when($this->status, fn ($query) => $query->where('status', $this->status))->latest()->paginate(10),
        ])->layout('components.layouts.app', ['title' => 'Order history']);
    }
}
