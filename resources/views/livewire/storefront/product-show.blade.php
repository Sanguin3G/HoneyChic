<div>
    <a href="{{ route('products.index') }}" class="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-orange-600"><x-icon name="arrow-left" size="16" /> Back to shop</a>
    <div class="grid gap-10 lg:grid-cols-[1.05fr_.95fr] lg:items-start">
        <div class="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            @if($product->image)<img src="{{ str($product->image)->startsWith('http') ? $product->image : asset('storage/'.$product->image) }}" alt="{{ $product->name }}" class="aspect-square w-full object-cover">@else<x-product-placeholder :product="$product" />@endif
        </div>
        <div class="pt-2">
            <p class="eyebrow">{{ $product->category?->name }}</p><h1 class="mt-3 text-4xl font-bold tracking-tight text-slate-950">{{ $product->name }}</h1>
            <div class="mt-4 flex items-center gap-3"><span class="text-2xl font-bold text-slate-950">${{ number_format($product->price, 2) }}</span><span class="text-sm text-slate-500">SKU {{ $product->sku }}</span></div>
            <p class="prose-store mt-6">{{ $product->description }}</p>
            <div class="mt-7 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div class="flex items-center justify-between text-sm"><span class="font-medium text-slate-700">Availability</span><span class="font-semibold {{ $product->stock_quantity > 0 ? 'text-emerald-600' : 'text-red-600' }}">{{ $product->stock_quantity > 0 ? $product->stock_quantity.' in stock' : 'Sold out' }}</span></div><div class="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"><div class="h-full rounded-full bg-orange-500" style="width: {{ min(100, max(4, $product->stock_quantity * 4)) }}%"></div></div></div>
            @if($product->stock_quantity > 0)
                <div class="mt-7 flex flex-wrap gap-3"><div class="flex items-center rounded-xl border border-slate-300 bg-white"><button type="button" wire:click="decrementQuantity" class="p-3 text-slate-500 hover:text-slate-900" aria-label="Decrease quantity"><x-icon name="minus" size="16" /></button><span class="w-10 text-center text-sm font-semibold">{{ $quantity }}</span><button type="button" wire:click="incrementQuantity" class="p-3 text-slate-500 hover:text-slate-900" aria-label="Increase quantity"><x-icon name="plus" size="16" /></button></div><button type="button" wire:click="addToCart" wire:loading.attr="disabled" class="btn btn-primary flex-1 sm:flex-none">Add to cart <x-icon name="shopping-bag" size="17" /></button></div>
            @else
                <div class="mt-7 rounded-xl bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600">This item is currently sold out. Check back soon.</div>
            @endif
            @error('cart')<p class="mt-3 text-sm text-red-600">{{ $message }}</p>@enderror
            <div class="mt-8 grid gap-3 border-t border-slate-200 pt-6 text-sm text-slate-600 sm:grid-cols-3"><div><span class="mb-1 block text-slate-950">Free delivery</span>Orders over $75</div><div><span class="mb-1 block text-slate-950">Easy returns</span>Within 30 days</div><div><span class="mb-1 block text-slate-950">Simple checkout</span>Cash on delivery</div></div>
        </div>
    </div>

    <section class="mt-16 border-t border-slate-200 pt-12"><div class="flex items-end justify-between"><div><p class="eyebrow">Customer notes</p><h2 class="mt-2 text-2xl font-bold text-slate-950">Reviews</h2></div><div class="text-right"><x-stars :rating="round($reviews->avg('rating') ?? 0)" /><p class="mt-1 text-xs text-slate-500">{{ $reviews->count() }} reviews</p></div></div><div class="mt-7 grid gap-4 md:grid-cols-2">@forelse($reviews as $review)<article class="surface p-5"><div class="flex items-center justify-between gap-3"><x-stars :rating="$review->rating" /><span class="text-xs text-slate-400">{{ $review->created_at->format('M Y') }}</span></div><h3 class="mt-3 font-semibold text-slate-950">{{ $review->title ?: 'A thoughtful purchase' }}</h3><p class="mt-2 text-sm leading-6 text-slate-600">{{ $review->body }}</p><p class="mt-4 text-xs font-medium text-slate-500">{{ $review->user->name }}</p></article>@empty<p class="text-sm text-slate-500">No reviews yet. Be the first to try it.</p>@endforelse</div></section>
    <section class="mt-16"><div class="flex items-end justify-between"><div><p class="eyebrow">More like this</p><h2 class="mt-2 text-2xl font-bold text-slate-950">You may also like</h2></div></div><div class="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">@foreach($relatedProducts as $related)<x-product-card :product="$related" />@endforeach</div></section>
</div>
