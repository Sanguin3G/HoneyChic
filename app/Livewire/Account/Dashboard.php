<?php

namespace App\Livewire\Account;

use App\Models\Order;
use Livewire\Component;

class Dashboard extends Component
{
    public function render()
    {
        $orders = Order::query()->where('user_id', auth()->id())->latest()->take(5)->get();

        return view('livewire.account.dashboard', [
            'orders' => $orders,
            'orderCount' => Order::where('user_id', auth()->id())->count(),
            'totalSpent' => Order::where('user_id', auth()->id())->where('status', '!=', 'cancelled')->sum('total_amount'),
        ])->layout('components.layouts.app', ['title' => 'Your account']);
    }
}
