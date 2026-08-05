<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\Order\UpdateOrderStatusRequest;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\View\View;
use RuntimeException;

class OrderController extends Controller
{
    public function index(Request $request): View|JsonResponse
    {
        $search = $request->input('search');
        $statusFilter = $request->input('status');
        $sortField = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('direction', 'desc');

        $validSortFields = ['created_at', 'status', 'total_amount', 'id', 'order_number'];
        if (!in_array($sortField, $validSortFields, true)) {
            $sortField = 'created_at';
        }
        if (!in_array($sortDirection, ['asc', 'desc'], true)) {
            $sortDirection = 'desc';
        }

        $orders = Order::with('user')
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('id', 'like', "%{$search}%")
                        ->orWhere('order_number', 'like', "%{$search}%")
                        ->orWhereHas('user', fn ($userQuery) => $userQuery->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($statusFilter, fn ($query, $status) => $query->where('status', $status))
            ->orderBy($sortField, $sortDirection)
            ->paginate(15)
            ->withQueryString();

        if ($request->wantsJson()) {
            return response()->json($orders);
        }

        $statuses = Order::distinct()->pluck('status')->filter()->sort()->values()->all();
        if (empty($statuses)) {
            $statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];
        }

        return view('admin.orders.index', compact(
            'orders',
            'statuses',
            'search',
            'statusFilter',
            'sortField',
            'sortDirection'
        ));
    }

    public function show(Order $order): View
    {
        $order->load(['orderItems.product', 'user']);
        $statuses = ['pending', 'processing', 'shipped', 'completed', 'cancelled'];

        return view('admin.orders.show', compact('order', 'statuses'));
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): RedirectResponse
    {
        $newStatus = $request->validated('status');
        $oldStatus = $order->status;
        $stockStatuses = ['processing', 'shipped', 'completed'];

        try {
            DB::transaction(function () use ($order, $oldStatus, $newStatus, $stockStatuses): void {
                $order->load('orderItems');

                if ($oldStatus !== $newStatus && in_array($newStatus, $stockStatuses, true) !== in_array($oldStatus, $stockStatuses, true)) {
                    foreach ($order->orderItems as $item) {
                        $product = $item->product()->lockForUpdate()->first();

                        if (!$product) {
                            throw new RuntimeException('A product in this order no longer exists.');
                        }

                        if (in_array($newStatus, $stockStatuses, true)) {
                            if ($product->stock_quantity < $item->quantity) {
                                throw new RuntimeException("Not enough stock is available for {$product->name}.");
                            }

                            $product->decrement('stock_quantity', $item->quantity);
                        } else {
                            $product->increment('stock_quantity', $item->quantity);
                        }
                    }
                }

                $order->update(['status' => $newStatus]);
            });

            return redirect()->route('admin.orders.show', $order)
                ->with('status', 'Order status updated successfully. Stock levels adjusted if applicable.');
        } catch (\Throwable $e) {
            Log::error("Error updating order status for order ID {$order->id}: {$e->getMessage()}");

            return redirect()->route('admin.orders.show', $order)
                ->with('error', $e->getMessage());
        }
    }
}