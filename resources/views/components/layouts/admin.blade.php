@props(['title' => 'Admin'])

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    @include('partials.head', ['title' => $title])
</head>
<body x-data="{ mobileOpen: false }" class="min-h-screen bg-slate-100">
    <header class="border-b border-slate-800 bg-slate-950 text-white">
        <div class="page-shell flex min-h-20 items-center gap-6">
            <a href="{{ route('admin.dashboard') }}" class="flex items-center gap-3">
                <span class="flex size-10 items-center justify-center rounded-xl bg-orange-500 text-white"><x-icon name="shopping-bag" size="20" /></span>
                <span class="font-bold tracking-tight">LaraStore <span class="font-normal text-slate-400">/ Admin</span></span>
            </a>
            <nav class="hidden items-center gap-1 lg:flex" aria-label="Admin navigation">
                @foreach([
                    ['admin.dashboard', 'Dashboard', 'chart'],
                    ['admin.products.index', 'Products', 'package'],
                    ['admin.categories.index', 'Categories', 'tag'],
                    ['admin.orders.index', 'Orders', 'shopping-bag'],
                    ['admin.users.index', 'Customers', 'users'],
                    ['admin.reviews.index', 'Reviews', 'star'],
                    ['admin.chatbot.edit', 'Chatbot', 'message-circle'],
                ] as [$route, $label, $icon])
                    <a href="{{ route($route) }}" class="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium {{ request()->routeIs($route === 'admin.dashboard' ? $route : str_replace('.index', '.*', $route)) ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white' }}"><x-icon :name="$icon" size="16" />{{ $label }}</a>
                @endforeach
            </nav>
            <div class="ml-auto flex items-center gap-2">
                <a href="{{ route('home') }}" class="hidden rounded-xl px-3 py-2 text-sm font-medium text-slate-300 hover:bg-white/10 hover:text-white sm:block">View store</a>
                <button type="button" @click="mobileOpen = !mobileOpen" class="rounded-xl p-2 text-slate-300 hover:bg-white/10 lg:hidden" aria-label="Toggle admin navigation"><x-icon name="menu" size="20" /></button>
            </div>
        </div>
        <nav x-cloak x-show="mobileOpen" x-transition class="page-shell flex flex-col gap-1 border-t border-white/10 py-4 lg:hidden" aria-label="Mobile admin navigation">
            <a href="{{ route('admin.dashboard') }}" class="rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white">Dashboard</a>
            <a href="{{ route('admin.products.index') }}" class="rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white">Products</a>
            <a href="{{ route('admin.categories.index') }}" class="rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white">Categories</a>
            <a href="{{ route('admin.orders.index') }}" class="rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white">Orders</a>
            <a href="{{ route('admin.users.index') }}" class="rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white">Customers</a>
            <a href="{{ route('admin.reviews.index') }}" class="rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white">Reviews</a>
            <a href="{{ route('admin.chatbot.edit') }}" class="rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white">Chatbot</a>
        </nav>
    </header>
    @if(session('success') || session('status') || session('error'))
        <div class="page-shell pt-5"><x-alert :type="session('error') ? 'error' : 'success'" :message="session('error') ?? session('success') ?? session('status')" /></div>
    @endif
    <main class="page-shell py-8 sm:py-10">
        <div class="mb-8"><p class="eyebrow">LaraStore control room</p><h1 class="mt-1 text-3xl font-bold tracking-tight text-slate-950">{{ $title }}</h1></div>
        {{ $slot }}
    </main>
    @livewireScripts
</body>
</html>
