<?php

use App\Http\Controllers\Auth\ConfirmPasswordController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Settings\AppearanceController;
use App\Http\Controllers\Settings\DeleteUserController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Livewire\Account\Dashboard as AccountDashboard;
use App\Livewire\Account\OrderIndex;
use App\Livewire\Account\OrderShow;
use App\Livewire\Admin\Categories as AdminCategories;
use App\Livewire\Admin\Dashboard as AdminDashboard;
use App\Livewire\Admin\Orders as AdminOrders;
use App\Livewire\Admin\Products as AdminProducts;
use App\Livewire\Admin\Reviews as AdminReviews;
use App\Livewire\Admin\Users as AdminUsers;
use App\Livewire\Storefront\CartPage;
use App\Livewire\Storefront\CheckoutPage;
use App\Livewire\Storefront\Home;
use App\Livewire\Storefront\ProductIndex;
use App\Livewire\Storefront\ProductShow;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', Home::class)->name('home');

Route::get('/products', ProductIndex::class)->name('products.index');
Route::get('/products/{product:slug}', ProductShow::class)->name('products.show');
Route::get('/cart', CartPage::class)->name('cart.view');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', AccountDashboard::class)->name('dashboard');
    Route::get('/orders', OrderIndex::class)->name('orders');
    Route::get('/orders/{order}', OrderShow::class)->name('orders.show');
    Route::get('/checkout', CheckoutPage::class)->name('checkout.show');

    // Settings routes
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::redirect('settings', 'settings/profile');

        Route::get('settings/profile', [ProfileController::class, 'edit'])->name('settings.profile');
        Route::patch('settings/profile', [ProfileController::class, 'update'])->name('settings.profile.update');

        Route::get('settings/password', [PasswordController::class, 'edit'])->name('settings.password');
        Route::put('settings/password', [PasswordController::class, 'update'])->name('settings.password.update');

        Route::get('settings/appearance', [AppearanceController::class, 'edit'])->name('settings.appearance');
        Route::delete('settings/delete-account', [DeleteUserController::class, 'destroy'])->name('settings.delete-account');
    });


    Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
        Route::get('/', AdminDashboard::class)->name('dashboard');
        Route::get('/products', AdminProducts::class)->name('products.index');
        Route::get('/categories', AdminCategories::class)->name('categories.index');
        Route::get('/orders', AdminOrders::class)->name('orders.index');
        Route::get('/users', AdminUsers::class)->name('users.index');
        Route::get('/reviews', AdminReviews::class)->name('reviews.index');
    });
});

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
*/

// Login Routes
Route::get('login', [LoginController::class, 'showLoginForm'])->name('login.form');
Route::post('login', [LoginController::class, 'login'])->name('login');

// Registration Routes
Route::get('register', [RegisterController::class, 'showRegistrationForm'])->name('register.form');
Route::post('register', [RegisterController::class, 'register'])->name('register');

// Password Reset Link Routes
Route::get('forgot-password', [ForgotPasswordController::class, 'showLinkRequestForm'])->name('password.request');
Route::post('forgot-password', [ForgotPasswordController::class, 'sendResetLinkEmail'])->name('password.email');

// Password Reset Routes
Route::get('reset-password/{token}', [ResetPasswordController::class, 'showResetForm'])->name('password.reset');
Route::post('reset-password', [ResetPasswordController::class, 'reset'])->name('password.update');

Route::middleware('auth')->group(function () {
    // Email Verification Routes
    Route::get('verify-email', [VerifyEmailController::class, 'showNotice'])->name('verification.notice');
    Route::get('verify-email/{id}/{hash}', VerifyEmailController::class) // Uses __invoke
    ->middleware(['signed', 'throttle:6,1'])
        ->name('verification.verify');
    Route::post('email/verification-notification', [VerifyEmailController::class, 'sendVerificationNotification'])
        ->middleware('throttle:6,1')
        ->name('verification.send');

    // Password Confirmation Routes
    Route::get('confirm-password', [ConfirmPasswordController::class, 'showConfirmForm'])->name('password.confirm');
    Route::post('confirm-password', [ConfirmPasswordController::class, 'confirm'])->name('password.confirm.post');
});

// Logout Route
Route::post('logout', [LoginController::class, 'logout'])->name('logout');
