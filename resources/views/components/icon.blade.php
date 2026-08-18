@props(['name' => 'circle', 'size' => 20])

<svg {{ $attributes->merge(['class' => 'shrink-0']) }} width="{{ $size }}" height="{{ $size }}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    @switch($name)
        @case('search') <circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/> @break
        @case('shopping-bag') <path d="M6 8h12l1 13H5L6 8Z"/><path d="M9 8a3 3 0 0 1 6 0"/> @break
        @case('user') <circle cx="12" cy="8" r="3"/><path d="M5 21a7 7 0 0 1 14 0"/> @break
        @case('menu') <path d="M4 6h16M4 12h16M4 18h16"/> @break
        @case('x') <path d="m6 6 12 12M18 6 6 18"/> @break
        @case('chevron-down') <path d="m6 9 6 6 6-6"/> @break
        @case('chevron-up') <path d="m18 15-6-6-6 6"/> @break
        @case('chevron-left') <path d="m15 18-6-6 6-6"/> @break
        @case('chevron-right') <path d="m9 18 6-6-6-6"/> @break
        @case('arrow-right') <path d="M5 12h14M13 6l6 6-6 6"/> @break
        @case('arrow-left') <path d="M19 12H5m6 6-6-6 6-6"/> @break
        @case('plus') <path d="M12 5v14M5 12h14"/> @break
        @case('minus') <path d="M5 12h14"/> @break
        @case('trash') <path d="M4 7h16M10 11v6M14 11v6M6 7l1 14h10l1-14M9 7V4h6v3"/> @break
        @case('check') <path d="m5 12 4 4L19 6"/> @break
        @case('star') <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"/> @break
        @case('heart') <path d="M20.8 8.8c0 5.5-8.8 10.2-8.8 10.2S3.2 14.3 3.2 8.8A4.6 4.6 0 0 1 12 6.6a4.6 4.6 0 0 1 8.8 2.2Z"/> @break
        @case('package') <path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="M3 8v8l9 5 9-5V8M12 13v8"/> @break
        @case('grid') <rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/> @break
        @case('tag') <path d="M20 13 13 20l-9-9V4h7l9 9Z"/><circle cx="8" cy="8" r="1"/> @break
        @case('users') <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/> @break
        @case('chart') <path d="M4 19V5M4 19h16M8 16v-5M12 16V7M16 16v-9"/> @break
        @case('settings') <circle cx="12" cy="12" r="3"/><path d="M19.4 15a2 2 0 1 0 0 2.8l.1-.1a2 2 0 0 0 1.4-3.4h-.3a2 2 0 0 1 0-4h.3a2 2 0 1 0-1.4-3.4l-.1-.1A2 2 0 1 0 16.6 5l.1.1a2 2 0 0 1-3.4-1.4v-.3a2 2 0 1 0-4 0v.3A2 2 0 0 1 6 5.1l-.1-.1A2 2 0 1 0 3.1 7.8l.1.1a2 2 0 0 1-1.4 3.4h-.3a2 2 0 1 0 0 4h.3a2 2 0 0 1 1.4 3.4l-.1.1A2 2 0 1 0 6 21.5l.1-.1a2 2 0 0 1 3.4 1.4v.3a2 2 0 1 0 4 0v-.3a2 2 0 0 1 3.4-1.4l-.1.1a2 2 0 1 0 2.8-2.8l-.1-.1a2 2 0 0 1 0-3.6Z"/> @break
        @case('logout') <path d="M10 17l5-5-5-5M15 12H3M21 19V5a2 2 0 0 0-2-2h-4"/> @break
        @case('edit') <path d="m4 16-.8 4.8L8 20l11-11-4-4L4 16Z"/><path d="m13 6 4 4"/> @break
        @case('eye') <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="2.5"/> @break
        @case('filter') <path d="M4 6h16M7 12h10M10 18h4"/> @break
        @case('calendar') <rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/> @break
        @case('circle-alert') <circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/> @break
        @case('mail') <rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/> @break
        @case('message-circle') <path d="M20 11.5a8 8 0 0 1-8 8 8.7 8.7 0 0 1-3.9-.9L4 20l1.4-3.6A8 8 0 1 1 20 11.5Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/> @break
        @default <circle cx="12" cy="12" r="9"/>
    @endswitch
</svg>
