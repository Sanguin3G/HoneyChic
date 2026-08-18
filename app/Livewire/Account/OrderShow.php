<?php

namespace App\Livewire\Account;

use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Review;
use Illuminate\Support\Facades\DB;
use Livewire\Component;

class OrderShow extends Component
{
    public Order $order;
    public ?int $reviewProductId = null;
    public int $reviewRating = 5;
    public string $reviewTitle = '';
    public string $reviewBody = '';

    public function mount(Order $order): void
    {
        abort_unless($order->user_id === auth()->id(), 403);
        $this->order = $order->load(['orderItems.product', 'statusHistories.actor', 'reviews']);
    }

    public function cancel(): void
    {
        if (! $this->order->canBeCancelled()) {
            $this->addError('order', 'This order can no longer be cancelled.');
            return;
        }

        DB::transaction(function (): void {
            foreach ($this->order->orderItems as $item) {
                $item->product?->increment('stock_quantity', $item->quantity);
            }
            $from = $this->order->status;
            $this->order->update(['status' => 'cancelled']);
            OrderStatusHistory::create([
                'order_id' => $this->order->id,
                'from_status' => $from,
                'to_status' => 'cancelled',
                'note' => 'Cancelled by customer',
                'created_by' => auth()->id(),
            ]);
        });

        $this->order->refresh()->load(['orderItems.product', 'statusHistories.actor', 'reviews']);
        session()->flash('success', 'Your order was cancelled and inventory was returned.');
    }

    public function startReview(int $productId): void
    {
        $this->reviewProductId = $productId;
        $this->resetValidation();
    }

    public function saveReview(): void
    {
        $this->validate([
            'reviewProductId' => ['required', 'integer'],
            'reviewRating' => ['required', 'integer', 'between:1,5'],
            'reviewTitle' => ['nullable', 'string', 'max:120'],
            'reviewBody' => ['required', 'string', 'max:1000'],
        ]);

        abort_unless($this->order->isFulfilled() && $this->order->orderItems->contains('product_id', $this->reviewProductId), 403);

        Review::updateOrCreate(
            ['product_id' => $this->reviewProductId, 'user_id' => auth()->id()],
            ['order_id' => $this->order->id, 'rating' => $this->reviewRating, 'title' => $this->reviewTitle ?: null, 'body' => $this->reviewBody, 'status' => 'pending']
        );

        $this->reset(['reviewProductId', 'reviewRating', 'reviewTitle', 'reviewBody']);
        session()->flash('success', 'Thanks. Your review is awaiting approval.');
    }

    public function render()
    {
        return view('livewire.account.order-show')->layout('components.layouts.app', ['title' => "Order {$this->order->order_number}"]);
    }
}
