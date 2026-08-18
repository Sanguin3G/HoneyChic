<a href="{{ route('cart.view') }}" class="relative rounded-xl p-2.5 text-slate-600 hover:bg-slate-100" aria-label="Shopping cart">
    <x-icon name="shopping-bag" size="21" />
    @if($count > 0)
        <span wire:key="cart-count-{{ $count }}" class="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-orange-600 text-[11px] font-bold text-white">{{ $count }}</span>
    @endif
</a>
