@props(['product', 'size' => 'large'])
@php($dimensions = match ($size) {
    'small', 'sm' => 'size-12 rounded-xl text-sm',
    'medium', 'md' => 'size-16 rounded-2xl text-lg',
    default => 'size-24 rounded-3xl text-3xl',
})
<div class="flex aspect-square w-full items-center justify-center bg-gradient-to-br from-orange-100 via-amber-50 to-slate-100">
    <span class="flex {{ $dimensions }} items-center justify-center bg-white/80 font-bold text-orange-700 shadow-sm">{{ $product->initials }}</span>
</div>
