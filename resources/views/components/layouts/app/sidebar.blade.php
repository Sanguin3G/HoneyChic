<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="dark">
    <head>
        @include('partials.head')
    </head>
    <body class="min-h-screen bg-white dark:bg-zinc-800">
        <flux:sidebar sticky stashable class="border-r border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900">
            <flux:sidebar.toggle class="lg:hidden" icon="x-mark" />

            <a href="{{ auth()->check() && auth()->user()->role === 'admin' ? route('admin.dashboard') : route('dashboard') }}" class="me-5 flex items-center space-x-2 rtl:space-x-reverse" wire:navigate>
                <x-app-logo />
            </a>

            <flux:navlist variant="outline">
                <flux:navlist.group :heading="__('Platform')" class="grid">
                    <flux:navlist.item icon="home" :href="auth()->check() && auth()->user()->role === 'admin' ? route('admin.dashboard') : route('dashboard')" :current="request()->routeIs(auth()->check() && auth()->user()->role === 'admin' ? 'admin.dashboard' : 'dashboard')" wire:navigate>{{ __('Dashboard') }}</flux:navlist.item>
                    <flux:navlist.item icon="cube" :href="route('products.index')" :current="request()->routeIs('products.index')" wire:navigate>{{ __('Products') }}</flux:navlist.item>
                    @if(auth()->check() && auth()->user()->role === 'customer')
                    <flux:navlist.item icon="clipboard" :href="route('orders')" :current="request()->routeIs('orders')" wire:navigate>{{ __('My Orders') }}</flux:navlist.item>
                    <flux:navlist.item icon="shopping-cart" :href="route('cart.view')" :current="request()->routeIs('cart.view') || request()->routeIs('cart.add') || request()->routeIs('checkout.*')" wire:navigate>
                        <span>{{ __('Cart') }}</span>
                        @if(isset($cartItemCount) && $cartItemCount > 0)
                            <span class="ml-auto inline-block py-0.5 px-2 text-xs font-semibold text-white bg-orange-500 rounded-full">
                                {{ $cartItemCount }}
                            </span>
                        @endif
                    </flux:navlist.item>
                    @endif
                </flux:navlist.group>
            </flux:navlist>

            <flux:spacer />

            <flux:navlist variant="outline">
                <flux:navlist.item icon="archive-box" href="https://github.com/imacrayon/blade-starter-kit" target="_blank">
                {{ __('Repository') }}
                </flux:navlist.item>

                <flux:navlist.item icon="book-open" href="https://laravel.com/docs/starter-kits" target="_blank">
                {{ __('Documentation') }}
                </flux:navlist.item>
            </flux:navlist>

            <!-- Desktop User Menu -->
            <flux:dropdown position="bottom" align="start">
                @auth
                <flux:profile
                    :name="auth()->user()->name"
                    :initials="auth()->user()->initials()"
                    icon-trailing="arrow-down"
                />
                @else
                <flux:profile
                    :name="__('Guest')"
                    initials="G"
                    icon-trailing="arrow-down"
                />
                @endauth

                <flux:menu class="w-[220px]">
                    <flux:menu.radio.group>
                        <div class="p-0 text-sm font-normal">
                            <div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                                <span class="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-lg">
                                    <span
                                        class="flex h-full w-full items-center justify-center rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white"
                                    >
                                        @auth
                                            {{ auth()->user()->initials() }}
                                        @else
                                            G
                                        @endauth
                                    </span>
                                </span>

                                <div class="grid flex-1 text-start text-sm leading-tight">
                                    @auth
                                        <span class="truncate font-semibold">{{ auth()->user()->name }}</span>
                                        <span class="truncate text-xs">{{ auth()->user()->email }}</span>
                                    @else
                                        <span class="truncate font-semibold">{{ __('Guest') }}</span>
                                        <span class="truncate text-xs">{{ __('Not logged in') }}</span>
                                    @endauth
                                </div>
                            </div>
                        </div>
                    </flux:menu.radio.group>

                    <flux:menu.separator />

                    @auth
                        <flux:menu.radio.group>
                            <flux:menu.item :href="route('settings.profile')" icon="cog" wire:navigate>{{ __('Settings') }}</flux:menu.item>
                        </flux:menu.radio.group>

                        <flux:menu.separator />

                        <form method="POST" action="{{ route('logout') }}" class="w-full">
                            @csrf
                            <flux:menu.item as="button" type="submit" icon="arrow-right-start-on-rectangle" class="w-full">
                                {{ __('Log Out') }}
                            </flux:menu.item>
                        </form>
                    @else
                        <flux:menu.radio.group>
                            <flux:menu.item :href="route('login')" icon="arrow-right-end-on-rectangle" wire:navigate>{{ __('Log In') }}</flux:menu.item>
                        </flux:menu.radio.group>
                    @endauth
                </flux:menu>
            </flux:dropdown>
        </flux:sidebar>

        <!-- Mobile User Menu -->
        <flux:header class="lg:hidden">
            <flux:sidebar.toggle class="lg:hidden" icon="bars-2" inset="left" />

            <flux:spacer />

            <flux:dropdown position="top" align="end">
                @auth
                <flux:profile
                    :initials="auth()->user()->initials()"
                    icon-trailing="chevron-down"
                />
                @else
                <flux:profile
                    initials="G"
                    icon-trailing="chevron-down"
                />
                @endauth

                <flux:menu>
                    <flux:menu.radio.group>
                        <div class="p-0 text-sm font-normal">
                            <div class="flex items-center gap-2 px-1 py-1.5 text-start text-sm">
                                <span class="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-lg">
                                    <span
                                        class="flex h-full w-full items-center justify-center rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white"
                                    >
                                        @auth
                                            {{ auth()->user()->initials() }}
                                        @else
                                            G
                                        @endauth
                                    </span>
                                </span>

                                <div class="grid flex-1 text-start text-sm leading-tight">
                                    @auth
                                        <span class="truncate font-semibold">{{ auth()->user()->name }}</span>
                                        <span class="truncate text-xs">{{ auth()->user()->email }}</span>
                                    @else
                                        <span class="truncate font-semibold">{{ __('Guest') }}</span>
                                        <span class="truncate text-xs">{{ __('Not logged in') }}</span>
                                    @endauth
                                </div>
                            </div>
                        </div>
                    </flux:menu.radio.group>

                    <flux:menu.separator />

                    @auth
                        <flux:menu.radio.group>
                            <flux:menu.item :href="route('settings.profile')" icon="cog" wire:navigate>{{ __('Settings') }}</flux:menu.item>
                        </flux:menu.radio.group>

                        <flux:menu.separator />

                        <form method="POST" action="{{ route('logout') }}" class="w-full">
                            @csrf
                            <flux:menu.item as="button" type="submit" icon="arrow-right-start-on-rectangle" class="w-full">
                                {{ __('Log Out') }}
                            </flux:menu.item>
                        </form>
                    @else
                        <flux:menu.radio.group>
                            <flux:menu.item :href="route('login')" icon="arrow-right-end-on-rectangle" wire:navigate>{{ __('Log In') }}</flux:menu.item>
                        </flux:menu.radio.group>
                    @endauth
                </flux:menu>
            </flux:dropdown>
        </flux:header>

        @if (isset($slot))
            {{ $slot }}
        @else
            @yield('content')
        @endif

    @livewireScripts {{-- Added Livewire scripts --}}
    </body>
</html>
{{-- Updated: route('settings.profile') to route('settings.profile') --}}
{{-- Removed @fluxScripts as Alpine is loaded via Vite --}}
