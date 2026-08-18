<?php

namespace App\Livewire\Admin;

use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Livewire\Component;

class Dashboard extends Component
{
    public function render()
    {
        return view('livewire.admin.dashboard', [
            'stats' => [
                'orders' => Order::count(),
                'pending' => Order::where('status', 'pending')->count(),
                'revenue' => Order::whereIn('status', ['processing', 'shipped', 'completed'])->sum('total_amount'),
                'customers' => User::where('role', 'customer')->count(),
            ],
            'recentOrders' => Order::with('user')->latest()->take(6)->get(),
            'lowStockProducts' => Product::where('is_published', true)->where('stock_quantity', '<=', 10)->orderBy('stock_quantity')->take(6)->get(),
        ])->layout('components.layouts.admin', ['title' => 'Dashboard']);
    }
}
