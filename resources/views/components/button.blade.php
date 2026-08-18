@props(['type' => 'button', 'variant' => 'primary', 'href' => null])

@php
    $variantClass = match ($variant) {
        'secondary', 'outline' => 'btn-secondary',
        'dark' => 'btn-dark',
        'danger' => 'btn-danger',
        default => 'btn-primary',
    };
@endphp

@if($href)
    <a href="{{ $href }}" {{ $attributes->merge(['class' => "btn {$variantClass}"]) }}>{{ $slot }}</a>
@else
    <button type="{{ $type }}" {{ $attributes->merge(['class' => "btn {$variantClass}"]) }}>{{ $slot }}</button>
@endif
