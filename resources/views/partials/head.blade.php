<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="csrf-token" content="{{ csrf_token() }}">

<title>{{ $title ?? config('app.name', 'My Shop') }}</title>

<script>
    (() => {
        const storageKey = 'larastore-theme';
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

        const applyTheme = (mode) => {
            const isDark = mode === 'dark' || (mode === 'system' && mediaQuery.matches);
            document.documentElement.classList.toggle('dark', isDark);
            document.documentElement.dataset.theme = mode;
            document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
        };

        window.LaraStoreTheme = { apply: applyTheme };
        applyTheme(localStorage.getItem(storageKey) || 'light');
        mediaQuery.addEventListener('change', () => {
            if (localStorage.getItem(storageKey) === 'system') {
                applyTheme('system');
            }
        });
    })();
</script>

<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="preconnect" href="https://fonts.bunny.net">
<link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600" rel="stylesheet" />

@vite(['resources/css/app.css', 'resources/js/app.js'])
@livewireStyles
