@props(['status'])
@php
    $style = match ($status) {
        'completed', 'approved' => 'bg-emerald-50 text-emerald-700 ring-emerald-200',
        'processing', 'pending' => 'bg-amber-50 text-amber-700 ring-amber-200',
        'shipped' => 'bg-sky-50 text-sky-700 ring-sky-200',
        'cancelled', 'rejected' => 'bg-red-50 text-red-700 ring-red-200',
        default => 'bg-slate-100 text-slate-600 ring-slate-200',
    };
@endphp
<span class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset {{ $style }}">{{ str_replace('_', ' ', $status) }}</span>
