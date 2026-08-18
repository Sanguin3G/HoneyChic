<?php

namespace App\Livewire\Admin;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Support\Facades\DB;
use Livewire\Component;
use Livewire\WithPagination;

class Orders extends Component
{
    use WithPagination;

    public string $search = '';
    public string $status = '';
    protected $queryString = ['search', 'status'];

    public function updatedSearch(): void { $this->resetPage(); }
    public function updatedStatus(): void { $this->resetPage(); }

    public function updateStatus(int $id, string $newStatus): void
    {
        $order = Order::with('orderItems.product')->findOrFail($id);
        $allowed = [
            'pending' => ['processing', 'cancelled'],
            'processing' => ['shipped', 'cancelled'],
            'shipped' => ['completed'],
            'completed' => [],
            'cancelled' => [],
        ];

        if (! in_array($newStatus, $allowed[$order->status] ?? [], true)) {
            $this->addError('status', 'That order status transition is not allowed.');
            return;
        }

        DB::transaction(function () use ($order, $newStatus): void {
            $from = $order->status;
            if ($newStatus === 'cancelled') {
                foreach ($order->orderItems as $item) {
                    $item->product?->increment('stock_quantity', $item->quantity);
                }
            }

            $order->update(['status' => $newStatus]);
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'from_status' => $from,
                'to_status' => $newStatus,
                'note' => 'Updated by admin',
                'created_by' => auth()->id(),
            ]);
        });

        session()->flash('success', "Order {$order->order_number} updated.");
    }

    public function render()
    {
        return view('livewire.admin.orders', [
            'orders' => Order::with('user')->when($this->search, fn ($q) => $q->where(fn ($q) => $q->where('order_number', 'like', "%{$this->search}%")->orWhereHas('user', fn ($u) => $u->where('name', 'like', "%{$this->search}%"))))->when($this->status, fn ($q) => $q->where('status', $this->status))->latest()->paginate(12),
            'statuses' => ['pending', 'processing', 'shipped', 'completed', 'cancelled'],
        ])->layout('components.layouts.admin', ['title' => 'Orders']);
    }
}
