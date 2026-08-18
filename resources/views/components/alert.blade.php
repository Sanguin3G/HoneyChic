@props(['type' => 'info', 'message' => null])

@php
    $styles = match ($type) {
        'success' => 'border-emerald-200 bg-emerald-50 text-emerald-800',
        'error', 'danger' => 'border-red-200 bg-red-50 text-red-800',
        'warning' => 'border-amber-200 bg-amber-50 text-amber-800',
        default => 'border-sky-200 bg-sky-50 text-sky-800',
    };
@endphp

<div x-data="{ shown: true }" x-show="shown" x-transition {{ $attributes->merge(['class' => "flex items-start gap-3 rounded-xl border px-4 py-3 text-sm {$styles}"]) }} role="status">
    <div class="min-w-0 flex-1">{{ $message ?? $slot }}</div>
    <button type="button" @click="shown = false" class="rounded p-0.5 opacity-70 hover:opacity-100" aria-label="Dismiss notification"><x-icon name="x" size="16" /></button>
</div>
