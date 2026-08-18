<div>
    <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p class="eyebrow">LaraStore collection</p><h1 class="mt-2 text-4xl font-bold tracking-tight text-slate-950">Shop all products</h1><p class="mt-3 max-w-2xl text-slate-500">Useful things for your wardrobe, desk, daily carry, and slow mornings.</p></div><p class="text-sm text-slate-500">{{ $products->total() }} results</p></div>

    <div class="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        <aside class="surface h-fit p-5" aria-label="Product filters">
            <div class="flex items-center justify-between"><h2 class="font-semibold text-slate-950">Filter</h2><button type="button" wire:click="clearFilters" class="text-xs font-semibold text-orange-600 hover:text-orange-700">Clear all</button></div>
            <div class="mt-5 space-y-5">
                <div><label for="catalog-search" class="field-label">Search</label><div class="relative"><input id="catalog-search" wire:model.live.debounce.350ms="search" class="field-control pl-10" placeholder="Try “canvas”"/><x-icon name="search" size="17" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /></div></div>
                <div><label for="catalog-category" class="field-label">Category</label><select id="catalog-category" wire:model.live="category" class="field-control"><option value="">All categories</option>@foreach($categories as $item)<option value="{{ $item->slug }}">{{ $item->name }}</option>@endforeach</select></div>
                <div><label for="catalog-sort" class="field-label">Sort by</label><select id="catalog-sort" wire:model.live="sort" class="field-control"><option value="featured">Featured</option><option value="newest">Newest</option><option value="price_low">Price: low to high</option><option value="price_high">Price: high to low</option></select></div>
                <label class="flex cursor-pointer items-center gap-3 text-sm text-slate-700"><input type="checkbox" wire:model.live="availability" value="in_stock" class="size-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"><span>In stock only</span></label>
            </div>
        </aside>

        <div>
            <div wire:loading.flex class="mb-4 items-center gap-2 text-sm text-orange-700"><span class="size-4 animate-spin rounded-full border-2 border-orange-200 border-t-orange-600"></span> Updating the collection…</div>
            @if($products->count())
                <div class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">@foreach($products as $product)<x-product-card :product="$product" wire:key="product-{{ $product->id }}" />@endforeach</div>
                <div class="mt-8">{{ $products->links() }}</div>
            @else
                <x-empty-state title="Nothing matched that search" description="Try a different phrase or clear the filters to see the full collection." />
            @endif
        </div>
    </div>
</div>
