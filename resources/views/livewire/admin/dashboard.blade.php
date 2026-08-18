<div class="space-y-8">
    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        @foreach([
            ['Orders', $stats['orders'], 'All orders received', 'shopping-bag', 'text-orange-600 bg-orange-50'],
            ['Needs attention', $stats['pending'], 'Pending orders', 'circle-alert', 'text-amber-600 bg-amber-50'],
            ['Revenue', '$'.number_format($stats['revenue'], 2), 'Active and completed orders', 'chart', 'text-emerald-600 bg-emerald-50'],
            ['Customers', $stats['customers'], 'Registered shoppers', 'users', 'text-sky-600 bg-sky-50'],
        ] as [$label, $value, $caption, $icon, $iconStyle])
            <div class="surface p-5">
                <div class="flex items-start justify-between gap-4">
                    <div><p class="text-sm font-medium text-slate-500">{{ $label }}</p><p class="mt-2 text-3xl font-bold tracking-tight text-slate-950">{{ $value }}</p><p class="mt-2 text-xs text-slate-500">{{ $caption }}</p></div>
                    <span class="flex size-11 items-center justify-center rounded-2xl {{ $iconStyle }}"><x-icon :name="$icon" size="20" /></span>
                </div>
            </div>
        @endforeach
    </div>

    <div class="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <section class="surface overflow-hidden">
            <div class="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4"><div><h2 class="font-semibold text-slate-950">Recent orders</h2><p class="mt-1 text-sm text-slate-500">The latest activity across the store.</p></div><a class="link text-sm" href="{{ route('admin.orders.index') }}">View all</a></div>
            <div class="divide-y divide-slate-100">
                @forelse($recentOrders as $order)
                    <div class="flex items-center justify-between gap-4 px-5 py-4"><div class="min-w-0"><p class="font-semibold text-slate-900">{{ $order->order_number }}</p><p class="mt-1 truncate text-sm text-slate-500">{{ $order->customer_name ?: $order->user?->name ?: 'Guest customer' }} · {{ $order->created_at->format('M j, Y') }}</p></div><div class="text-right"><x-status-badge :status="$order->status" /><p class="mt-1 text-sm font-semibold text-slate-900">${{ number_format($order->total_amount, 2) }}</p></div></div>
                @empty
                    <x-empty-state title="No orders yet" description="Orders will appear here once customers check out." />
                @endforelse
            </div>
        </section>

        <section class="surface overflow-hidden">
            <div class="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4"><div><h2 class="font-semibold text-slate-950">Low stock</h2><p class="mt-1 text-sm text-slate-500">Restock these products soon.</p></div><a class="link text-sm" href="{{ route('admin.products.index') }}">Manage</a></div>
            <div class="divide-y divide-slate-100">
                @forelse($lowStockProducts as $product)
                    <div class="flex items-center justify-between gap-4 px-5 py-4"><div class="min-w-0"><p class="truncate font-semibold text-slate-900">{{ $product->name }}</p><p class="mt-1 text-xs text-slate-500">{{ $product->sku }}</p></div><span class="rounded-full px-2.5 py-1 text-xs font-semibold {{ $product->stock_quantity === 0 ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700' }}">{{ $product->stock_quantity }} left</span></div>
                @empty
                    <div class="px-5 py-10 text-center text-sm text-slate-500">Everything is comfortably stocked.</div>
                @endforelse
            </div>
        </section>
    </div>
</div>
