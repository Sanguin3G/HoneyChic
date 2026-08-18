@props(['title' => 'Account'])

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    @include('partials.head', ['title' => $title])
</head>
<body class="min-h-screen bg-slate-100 text-slate-900">
    <div class="flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
        <main class="w-full max-w-md">
            <a href="{{ route('home') }}" class="mx-auto mb-8 flex w-fit items-center gap-3">
                <span class="flex size-11 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20"><x-icon name="shopping-bag" size="22" /></span>
                <span class="text-xl font-bold tracking-tight text-slate-950">LaraStore</span>
            </a>
            <section class="surface p-6 sm:p-8">
                {{ $slot }}
            </section>
            <p class="mt-6 text-center text-xs text-slate-500">A small Laravel shop, thoughtfully made.</p>
        </main>
    </div>
</body>
</html>
