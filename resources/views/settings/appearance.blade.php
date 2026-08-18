<x-layouts.app> {{-- Add main app layout wrapper --}}
    <section class="w-full">
        @include('partials.settings-heading')

        <x-settings.layout :heading="__('Appearance')" :subheading="__('Choose the visual mode for this practice project')">
            <div x-data="{ mode: localStorage.getItem('larastore-theme') || 'light' }" x-init="LaraStoreTheme.apply(mode); $watch('mode', value => { localStorage.setItem('larastore-theme', value); LaraStoreTheme.apply(value); })" class="space-y-3">
                @foreach([['light', 'Light', 'A bright, focused storefront for everyday use.'], ['dark', 'Dark', 'A darker workspace for low-light browsing.'], ['system', 'System', 'Follow your device preference.']] as [$value, $label, $description])
                    <label class="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-200 p-4 transition hover:border-orange-300" :class="mode === '{{ $value }}' ? 'border-orange-400 bg-orange-50/50' : 'bg-white'"><input class="mt-1 size-4 text-orange-600 focus:ring-orange-500" type="radio" name="appearance" value="{{ $value }}" x-model="mode"><span><span class="block font-semibold text-slate-900">{{ __($label) }}</span><span class="mt-1 block text-sm text-slate-500">{{ $description }}</span></span></label>
                @endforeach
            </div>
        </x-settings.layout>
    </section>
</x-layouts.app> {{-- Close main app layout wrapper --}}
