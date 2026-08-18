<div>
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p class="eyebrow">Your selection</p><h1 class="mt-2 text-4xl font-bold tracking-tight text-slate-950">Shopping cart</h1></div><a href="{{ route('products.index') }}" class="link">Continue shopping <span aria-hidden="true">→</span></a></div>
    @error('cart')<div class="mt-6"><x-alert type="error" :message="$message" /></div>@enderror

    @if($items->isEmpty())
        <div class="mt-8"><x-empty-state title="Your cart is waiting for something good" description="Browse the collection and add pieces you will actually use." href="{{ route('products.index') }}" action="Start shopping" /></div>
    @else
        <div class="mt-8 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
            <div class="surface divide-y divide-slate-100 p-2 sm:p-4">
                @foreach($items as $item)
                    <div class="flex gap-4 p-3 sm:p-4" wire:key="cart-{{ $item['product_id'] }}">
                        <a href="{{ route('products.show', $item['product']) }}" class="size-24 shrink-0 overflow-hidden rounded-xl bg-orange-50 sm:size-28">@if($item['image'])<img src="{{ str($item['image'])->startsWith('http') ? $item['image'] : asset('storage/'.$item['image']) }}" alt="{{ $item['name'] }}" class="h-full w-full object-cover">@else<x-product-placeholder :product="$item['product']" size="small" />@endif</a>
                        <div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-3"><div><p class="text-xs text-slate-500">{{ $item['product']->category?->name }}</p><a href="{{ route('products.show', $item['product']) }}" class="mt-1 block font-semibold text-slate-950 hover:text-orange-600">{{ $item['name'] }}</a></div><p class="font-bold text-slate-950">${{ number_format($item['line_total'], 2) }}</p></div><p class="mt-1 text-sm text-slate-500">${{ number_format($item['price'], 2) }} each</p><div class="mt-4 flex items-center justify-between gap-3"><div class="flex items-center rounded-lg border border-slate-300 bg-white"><button type="button" wire:click="updateQuantity({{ $item['product_id'] }}, {{ max(1, $item['quantity'] - 1) }})" class="p-2 text-slate-500 hover:text-slate-900" aria-label="Decrease quantity"><x-icon name="minus" size="15" /></button><span class="w-8 text-center text-sm font-semibold">{{ $item['quantity'] }}</span><button type="button" wire:click="updateQuantity({{ $item['product_id'] }}, {{ min($item['stock_quantity'], $item['quantity'] + 1) }})" class="p-2 text-slate-500 hover:text-slate-900" aria-label="Increase quantity"><x-icon name="plus" size="15" /></button></div><button type="button" wire:click="remove({{ $item['product_id'] }})" class="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600"><x-icon name="trash" size="15" /> Remove</button></div></div>
                    </div>
                @endforeach
            </div>
            <aside class="surface p-6"><h2 class="text-lg font-semibold text-slate-950">Order summary</h2><div class="mt-5 space-y-3 text-sm"><div class="flex justify-between text-slate-600"><span>Subtotal</span><span>${{ number_format($subtotal, 2) }}</span></div><div class="flex justify-between text-slate-600"><span>Delivery</span><span class="font-medium text-emerald-600">Free</span></div></div><div class="mt-5 flex justify-between border-t border-slate-200 pt-5 text-lg font-bold text-slate-950"><span>Total</span><span>${{ number_format($subtotal, 2) }}</span></div><a href="{{ route('checkout.show') }}" class="btn btn-primary mt-6 w-full">Continue to checkout <x-icon name="arrow-right" size="17" /></a><p class="mt-3 text-center text-xs leading-5 text-slate-500">You will review your delivery details before placing the order.</p></aside>
        </div>
    @endif
</div>
