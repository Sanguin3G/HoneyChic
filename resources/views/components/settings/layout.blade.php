<div class="grid gap-8 lg:grid-cols-[220px_1fr]">
    <nav class="surface h-fit p-2" aria-label="Settings navigation">
        @foreach([['settings.profile', 'Profile', 'user'], ['settings.password', 'Password', 'settings'], ['settings.appearance', 'Appearance', 'grid']] as [$route, $label, $icon])
            <a href="{{ route($route) }}" class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium {{ request()->routeIs($route) ? 'bg-orange-50 text-orange-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950' }}"><x-icon :name="$icon" size="17" />{{ __($label) }}</a>
        @endforeach
    </nav>
    <div class="surface p-5 sm:p-8">
        <h2 class="text-xl font-bold text-slate-950">{{ $heading ?? '' }}</h2>
        <p class="mt-1 text-sm text-slate-500">{{ $subheading ?? '' }}</p>
        <div class="mt-7 w-full max-w-2xl">{{ $slot }}</div>
    </div>
</div>
