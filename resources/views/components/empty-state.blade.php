@props(['title', 'description' => null, 'href' => null, 'action' => null])
<div {{ $attributes->merge(['class' => 'surface px-6 py-14 text-center']) }}>
    <div class="mx-auto flex size-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600"><x-icon name="package" size="26" /></div>
    <h3 class="mt-4 text-lg font-semibold text-slate-950">{{ $title }}</h3>
    @if($description)<p class="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{{ $description }}</p>@endif
    @if($href)<a href="{{ $href }}" class="btn btn-primary mt-6">{{ $action ?? 'Continue shopping' }} <x-icon name="arrow-right" size="16" /></a>@endif
</div>
