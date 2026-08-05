<?php

use App\Http\Controllers\Admin\CategoryController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\OrderController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Auth\ConfirmPasswordController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\ResetPasswordController;
use App\Http\Controllers\Auth\VerifyEmailController;
use App\Http\Controllers\Customer\CartController;
use App\Http\Controllers\Customer\CheckoutController;
use App\Http\Controllers\Customer\DashboardController as CustomerDashboardController;
use App\Http\Controllers\Customer\OrderController as CustomerOrderController;
use App\Http\Controllers\Customer\ProductController;
use App\Http\Controllers\Settings\AppearanceController;
use App\Http\Controllers\Settings\DeleteUserController;
use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', static function () {
    return view('welcome');
})->name('home');

//Product routes
Route::get('/products', [ProductController::class, 'index'])->name('products.index');
Route::get('/products/{product}', [ProductController::class, 'show'])->name('products.show');


Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [CustomerDashboardController::class, 'index'])
        ->name('dashboard');

    // Order routes
    Route::get('/orders', [CustomerOrderController::class, 'index'])->name('orders');
    Route::get('/orders/{order}', [CustomerOrderController::class, 'show'])->name('orders.show');

    // Cart routes
    Route::prefix('cart')->name('cart.')->group(function () {
        Route::post('/add/{product}', [CartController::class, 'add'])->name('add');
        Route::get('/', [CartController::class, 'view'])->name('view');
        Route::patch('/update/{productId}', [CartController::class, 'update'])->name('update');
        Route::delete('/remove/{productId}', [CartController::class, 'remove'])->name('remove');
    });

    // Checkout routes
    Route::prefix('checkout')->name('checkout.')->group(function () {
        Route::get('/', [CheckoutController::class, 'show'])->name('show');
        Route::post('/', [CheckoutController::class, 'process'])->name('process');
    });

    // Settings routes
    Route::middleware(['auth'])->group(function () {
        Route::redirect('settings', 'settings/profile');

        Route::get('settings/profile', [ProfileController::class, 'edit'])->name('settings.profile');
        Route::patch('settings/profile', [ProfileController::class, 'update'])->name('settings.profile.update');

        Route::get('settings/password', [PasswordController::class, 'edit'])->name('settings.password');
        Route::put('settings/password', [PasswordController::class, 'update'])->name('settings.password.update');

        Route::get('settings/appearance', [AppearanceController::class, 'edit'])->name('settings.appearance');
        Route::delete('settings/delete-account', [DeleteUserController::class, 'destroy'])->name('settings.delete-account');
    });


    // Admin routes
    Route::prefix('admin')->name('admin.')->middleware(['auth', 'admin'])->group(function () {
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        // Admin Products
        Route::resource('products', AdminProductController::class)->except(['show']);

        // Admin Categories
        Route::resource('categories', CategoryController::class)->except(['show']);

        // Admin Users
        Route::resource('users', UserController::class)->except(['show']);
        Route::put('/users/{user}/restore', [UserController::class, 'restore'])->name('users.restore');

        // Admin Orders
        Route::get('/orders', [OrderController::class, 'index'])->name('orders.index');
        Route::get('/orders/{order}', [OrderController::class, 'show'])->name('orders.show');
        Route::put('/orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.updateStatus');
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
