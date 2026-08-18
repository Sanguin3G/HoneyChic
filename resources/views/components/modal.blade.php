@props(['show' => 'false'])

<div x-cloak x-show="{{ $show }}" x-transition.opacity class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
    <div @click.outside="{{ $show }} = false" {{ $attributes->merge(['class' => 'max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl']) }}>
        {{ $slot }}
    </div>
</div>
