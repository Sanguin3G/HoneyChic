<div>
<section class="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl">
    <div class="grid items-center gap-10 px-6 py-14 sm:px-10 lg:grid-cols-[1.05fr_.95fr] lg:px-16 lg:py-20">
        <div>
            <p class="eyebrow text-orange-300">Small-batch everyday goods</p>
            <h1 class="mt-4 max-w-2xl text-4xl font-bold tracking-tight sm:text-6xl">Buy fewer things. Choose better ones.</h1>
            <p class="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">LaraStore is a thoughtful little shop for useful objects, comfortable layers, and desk companions that earn their place.</p>
            <div class="mt-8 flex flex-wrap gap-3"><a href="{{ route('products.index') }}" class="btn bg-orange-500 text-white hover:bg-orange-400 focus:ring-orange-300">Browse the collection <x-icon name="arrow-right" size="17" /></a><a href="#featured" class="btn border border-white/20 bg-white/5 text-white hover:bg-white/10 focus:ring-white/20">See what’s new</a></div>
            <div class="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400"><span><strong class="text-white">Free delivery</strong> over $75</span><span><strong class="text-white">30-day</strong> easy returns</span><span><strong class="text-white">COD</strong> checkout</span></div>
        </div>
        <div class="relative mx-auto w-full max-w-md">
            <div class="absolute -inset-4 rounded-[2.5rem] bg-orange-500/20 blur-2xl"></div>
            <div class="relative grid grid-cols-2 gap-3 rounded-[2rem] border border-white/10 bg-white/10 p-3 backdrop-blur">
                <div class="flex aspect-square items-end rounded-[1.4rem] bg-gradient-to-br from-orange-300 via-amber-100 to-orange-50 p-5 text-slate-950"><div><p class="text-xs font-semibold uppercase tracking-widest text-orange-800">Carry</p><p class="mt-1 text-xl font-bold">Made for motion.</p></div></div>
                <div class="mt-8 flex aspect-square items-end rounded-[1.4rem] bg-gradient-to-br from-sky-200 via-white to-slate-100 p-5 text-slate-950"><div><p class="text-xs font-semibold uppercase tracking-widest text-sky-800">Studio</p><p class="mt-1 text-xl font-bold">Make room to think.</p></div></div>
                <div class="-mt-8 flex aspect-square items-end rounded-[1.4rem] bg-gradient-to-br from-rose-200 via-orange-50 to-white p-5 text-slate-950"><div><p class="text-xs font-semibold uppercase tracking-widest text-rose-800">Apparel</p><p class="mt-1 text-xl font-bold">Comfort, considered.</p></div></div>
                <div class="flex aspect-square items-end rounded-[1.4rem] bg-gradient-to-br from-emerald-200 via-white to-slate-100 p-5 text-slate-950"><div><p class="text-xs font-semibold uppercase tracking-widest text-emerald-800">Drinkware</p><p class="mt-1 text-xl font-bold">Take it slow.</p></div></div>
            </div>
        </div>
    </div>
</section>

<section class="mt-14" id="featured">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p class="eyebrow">Editor’s picks</p><h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-950">The good stuff, upfront.</h2></div><a href="{{ route('products.index') }}" class="link">View all products <span aria-hidden="true">→</span></a></div>
    <div class="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">@forelse($featuredProducts as $product)<x-product-card :product="$product" />@empty<div class="col-span-full"><x-empty-state title="The shelves are being restocked" description="Run the database seeder to load the curated practice catalogue." /></div>@endforelse</div>
</section>

<section class="mt-16">
    <div class="flex items-end justify-between"><div><p class="eyebrow">Shop by mood</p><h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-950">Start somewhere useful.</h2></div></div>
    <div class="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        @foreach($categories as $category)
            <a href="{{ route('products.index', ['category' => $category->slug]) }}" class="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"><span class="flex size-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600"><x-icon name="{{ $loop->iteration % 2 ? 'tag' : 'grid' }}" size="21" /></span><h3 class="mt-5 font-semibold text-slate-950 group-hover:text-orange-600">{{ $category->name }}</h3><p class="mt-1 text-sm text-slate-500">{{ $category->products_count }} products to explore</p></a>
        @endforeach
    </div>
</section>

<section class="mt-16">
    <div class="flex items-end justify-between"><div><p class="eyebrow">Fresh on the shelf</p><h2 class="mt-2 text-3xl font-bold tracking-tight text-slate-950">Recently added.</h2></div><a href="{{ route('products.index', ['sort' => 'newest']) }}" class="link">See the latest <span aria-hidden="true">→</span></a></div>
    <div class="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">@foreach($latestProducts as $product)<x-product-card :product="$product" />@endforeach</div>
</section>
</div>
