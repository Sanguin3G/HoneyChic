<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Illuminate\Auth\Events\Lockout;
use Illuminate\View\View;

class LoginController extends Controller
{
    /**
     * Display the login view.
     *
     * @return View
     */
    public function showLoginForm()
    {
        return view('auth.login');
    }

    /**
     * Handle an incoming authentication request.
     *
     * @param LoginRequest $request
     * @return RedirectResponse
     */
    public function login(LoginRequest $request)
    {
        // Validation passed

        // 2. Ensure not rate limited
        $this->ensureIsNotRateLimited($request);

        // 3. Attempt authentication
        if (!Auth::attempt($request->only('email', 'password'), $request->boolean('remember'))) {
            // Hit rate limiter on failed attempt
            RateLimiter::hit($this->throttleKey($request));

            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        // 4. Clear rate limiter on success
        RateLimiter::clear($this->throttleKey($request));

        // 5. Regenerate session
        $request->session()->regenerate();

        // 6. Redirect based on role
        $user = Auth::user();
        if ($user && $user->isAdmin()) {
            return redirect()->intended(route('admin.dashboard', absolute: false));
        }
        if ($user && $user->isCustomer()) {
            return redirect()->intended(route('dashboard', absolute: false));
        }
    }

    /**
     * Ensure the authentication request is not rate limited.
     *
     * @param LoginRequest $request
     * @return void
     *
     * @throws ValidationException
     */
    protected function ensureIsNotRateLimited(LoginRequest $request): void
    {
        if (!RateLimiter::tooManyAttempts($this->throttleKey($request), 5)) {
            return;
        }

        event(new Lockout($request));

        $seconds = RateLimiter::availableIn($this->throttleKey($request));

        throw ValidationException::withMessages([
            'email' => __('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the authentication rate limiting throttle key.
     *
     * @param LoginRequest $request
     * @return string
     */
    protected function throttleKey(LoginRequest $request): string
    {
        return Str::transliterate(Str::lower($request->input('email')) . '|' . $request->ip());
    }

    /**
     * Log the user out of the application.
     *
     * @param LoginRequest $request
     * @return RedirectResponse
     */
    public function logout(Request $request)
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/'); // Redirect to homepage after logout
    }
}
