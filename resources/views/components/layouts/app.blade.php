@props(['title' => null])

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    @include('partials.head', ['title' => $title])
    @stack('head')
</head>
<body x-data="{ mobileOpen: false, accountOpen: false }" class="min-h-screen bg-slate-50">
    <div class="border-b border-orange-100 bg-orange-50 px-4 py-2 text-center text-xs font-medium text-orange-900">
        Free delivery on orders over $75 · Built as a Laravel/TALL practice project
    </div>

    <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div class="page-shell flex h-20 items-center gap-5">
            <a href="{{ route('home') }}" aria-label="LaraStore home"><x-app-logo /></a>

            <nav class="hidden items-center gap-6 lg:flex" aria-label="Primary navigation">
                <a href="{{ route('products.index') }}" class="text-sm font-medium {{ request()->routeIs('products.*') ? 'text-orange-600' : 'text-slate-600 hover:text-slate-950' }}">Shop</a>
                @auth
                    <a href="{{ route('dashboard') }}" class="text-sm font-medium text-slate-600 hover:text-slate-950">Account</a>
                    @if(auth()->user()->isAdmin())
                        <a href="{{ route('admin.dashboard') }}" class="text-sm font-medium text-slate-600 hover:text-slate-950">Admin</a>
                    @endif
                @endauth
            </nav>

            <div class="ml-auto hidden max-w-md flex-1 md:block">
                <form action="{{ route('products.index') }}" method="GET" class="relative">
                    <label for="global-search" class="sr-only">Search products</label>
                    <input id="global-search" name="search" value="{{ request('search') }}" class="field-control pl-10" placeholder="Search products..." />
                    <x-icon name="search" size="18" class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </form>
            </div>

            <div class="ml-auto flex items-center gap-2 md:ml-0">
                <a href="{{ route('products.index') }}" class="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 md:hidden" aria-label="Shop">
                    <x-icon name="search" size="20" />
                </a>
                @livewire('storefront.cart-indicator')

                <div class="relative hidden sm:block">
                    <button type="button" @click="accountOpen = !accountOpen" @keydown.escape="accountOpen = false" :aria-expanded="accountOpen.toString()" class="flex items-center gap-2 rounded-xl p-2 text-sm font-medium text-slate-700 hover:bg-slate-100">
                        <span class="flex size-9 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">{{ auth()->check() ? auth()->user()->initials() : 'G' }}</span>
                        <span class="hidden max-w-24 truncate lg:block">{{ auth()->check() ? auth()->user()->name : 'Guest' }}</span>
                        <x-icon name="chevron-down" size="16" />
                    </button>
                    <div x-cloak x-show="accountOpen" x-transition @click.outside="accountOpen = false" class="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                        @auth
                            <div class="border-b border-slate-100 px-3 py-2">
                                <p class="truncate text-sm font-semibold text-slate-900">{{ auth()->user()->name }}</p>
                                <p class="truncate text-xs text-slate-500">{{ auth()->user()->email }}</p>
                            </div>
                            <a href="{{ route('dashboard') }}" class="mt-1 flex rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Account</a>
                            <a href="{{ route('settings.profile') }}" class="flex rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Settings</a>
                            <form method="POST" action="{{ route('logout') }}" class="mt-1 border-t border-slate-100 pt-1">@csrf<button class="flex w-full rounded-xl px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50">Sign out</button></form>
                        @else
                            <a href="{{ route('login.form') }}" class="flex rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Sign in</a>
                            <a href="{{ route('register.form') }}" class="flex rounded-xl px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">Create account</a>
                        @endauth
                    </div>
                </div>

                <button type="button" @click="mobileOpen = !mobileOpen" class="rounded-xl p-2.5 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Toggle navigation">
                    <x-icon name="menu" size="21" x-show="!mobileOpen" />
                    <x-icon name="x" size="21" x-show="mobileOpen" x-cloak />
                </button>
            </div>
        </div>
        <div x-cloak x-show="mobileOpen" x-transition class="border-t border-slate-100 bg-white lg:hidden">
            <nav class="page-shell flex flex-col gap-1 py-4" aria-label="Mobile navigation">
                <a href="{{ route('products.index') }}" class="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Shop</a>
                @auth
                    <a href="{{ route('dashboard') }}" class="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Account</a>
                    @if(auth()->user()->isAdmin())<a href="{{ route('admin.dashboard') }}" class="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Admin</a>@endif
                    <form method="POST" action="{{ route('logout') }}">@csrf<button class="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50">Sign out</button></form>
                @else
                    <a href="{{ route('login.form') }}" class="rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50">Sign in</a>
                @endauth
            </nav>
        </div>
    </header>

    @if(session('success') || session('status') || session('error'))
        <div class="page-shell pt-5">
            <x-alert :type="session('error') ? 'error' : 'success'" :message="session('error') ?? session('success') ?? session('status')" />
        </div>
    @endif

    <main class="page-shell py-8 sm:py-10">
        @isset($header)<div class="mb-8">{{ $header }}</div>@endisset
        {{ $slot }}
    </main>

    <footer class="mt-12 border-t border-slate-200 bg-white">
        <div class="page-shell flex flex-col gap-3 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© {{ date('Y') }} LaraStore · Laravel/TALL practice project #2</p>
            <p>Simple commerce, carefully built.</p>
        </div>
    </footer>

    @livewire('storefront.chatbot')
    @livewireScripts
    @stack('scripts')
</body>
</html>
