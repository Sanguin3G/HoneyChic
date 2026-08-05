<?php

namespace App\Providers;

use App\Http\View\Composers\CartComposer;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\View;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $phosphorPath = resource_path('views/components/phosphor');

        if (is_dir($phosphorPath)) {
            Blade::anonymousComponentPath($phosphorPath, 'phosphor');
        }

        View::composer('*', CartComposer::class);
    }
}