@props(['product'])

<article class="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
    <a href="{{ route('products.show', $product) }}" class="relative block aspect-[4/3] overflow-hidden bg-orange-50">
        @if($product->image)
            <img src="{{ str($product->image)->startsWith('http') ? $product->image : asset('storage/'.$product->image) }}" alt="{{ $product->name }}" class="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy">
        @else
            <div class="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-slate-100">
                <div class="text-center"><span class="mx-auto flex size-16 items-center justify-center rounded-2xl bg-white/80 text-2xl font-bold text-orange-700 shadow-sm">{{ $product->initials }}</span><span class="mt-3 block text-xs font-semibold uppercase tracking-[0.18em] text-orange-700/70">{{ $product->category?->name }}</span></div>
            </div>
        @endif
        @if($product->is_featured)<span class="absolute left-3 top-3 rounded-full bg-slate-950 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">Featured</span>@endif
        @if($product->stock_quantity < 1)<span class="absolute right-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-600">Sold out</span>@endif
    </a>
    <div class="flex flex-1 flex-col p-4">
        <div class="mb-1 flex items-center justify-between gap-3 text-xs text-slate-500"><span>{{ $product->category?->name }}</span><span>{{ $product->sku }}</span></div>
        <a href="{{ route('products.show', $product) }}" class="text-base font-semibold text-slate-950 hover:text-orange-600">{{ $product->name }}</a>
        <p class="mt-1 line-clamp-2 text-sm leading-6 text-slate-500">{{ $product->description }}</p>
        <div class="mt-auto flex items-center justify-between gap-3 pt-4"><span class="text-lg font-bold text-slate-950">${{ number_format($product->price, 2) }}</span><a href="{{ route('products.show', $product) }}" class="text-sm font-semibold text-orange-600 hover:text-orange-700">View details <span aria-hidden="true">→</span></a></div>
    </div>
</article>
