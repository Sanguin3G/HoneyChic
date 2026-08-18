<x-layouts.app>
    <section class="w-full">
        @include('partials.settings-heading')

        <x-settings.layout :heading="__('Profile')" :subheading="__('Update your name and email address')">

            {{-- Display Standard Success Message --}}
            @if (session('status') === 'profile-updated')
                <div class="mb-4 rounded-md bg-green-50 p-4 dark:bg-green-900/30">
                    <p class="text-sm font-medium text-green-800 dark:text-green-400">{{ __('Profile updated successfully.') }}</p>
                </div>
            @endif

            {{-- Display Standard General Validation Errors (if any not caught by field-specific errors) --}}
            @if ($errors->any() && !$errors->has('name') && !$errors->has('email'))
                <div class="mb-4 rounded-md bg-red-50 p-4 dark:bg-red-900/30">
                    <div class="flex">
                        <div class="flex-shrink-0">
                            <svg class="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                            </svg>
                        </div>
                        <div class="ml-3">
                            <h3 class="text-sm font-medium text-red-800 dark:text-red-400">{{ __('Something went wrong.') }}</h3>
                            <div class="mt-2 text-sm text-red-700 dark:text-red-400/80">
                                <ul role="list" class="list-disc space-y-1 pl-5">
                                    @foreach ($errors->all() as $error)
                                        <li>{{ $error }}</li>
                                    @endforeach
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            @endif

            <form method="POST" action="{{ route('settings.profile.update') }}" class="my-6 w-full space-y-6">
                @csrf
                @method('PATCH')

                {{-- Name Input --}}
                <div>
                    <x-input
                        name="name"
                        label="{{ __('Name') }}"
                        type="text"
                        required
                        autofocus
                        autocomplete="name"
                        value="{{ old('name', $user->name) }}"
                    />
                     @error('name') <p class="mt-2 text-sm text-red-600">{{ $message }}</p> @enderror
                </div>


                {{-- Email Input & Verification --}}
                <div>
                    <x-input
                        name="email"
                        label="{{ __('Email') }}"
                        type="email"
                        required
                        autocomplete="email"
                        value="{{ old('email', $user->email) }}"
                    />
                     @error('email') <p class="mt-2 text-sm text-red-600">{{ $message }}</p> @enderror

                    {{-- Check if user must verify email and hasn't --}}
                    {{-- This x-show can remain as it's simple UI toggling --}}
                    @if ($user instanceof \Illuminate\Contracts\Auth\MustVerifyEmail && ! $user->hasVerifiedEmail())
                        <div x-data="{ needsReverification: {{ !$user->hasVerifiedEmail() && old('email', $user->email) === $user->email ? 'true' : 'false' }} }" x-show="needsReverification" class="mt-4">
                            <p>
                                {{ __('Your email address is unverified.') }}
                                {{-- Resend Verification Form (standard POST) --}}
                                <form method="POST" action="{{ route('verification.send') }}" class="inline">
                                    @csrf
                                    <button type="submit" class="ml-2 cursor-pointer text-sm text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        {{ __('Click here to re-send the verification email.') }}
                                    </button>
                                </form>
                            </p>
                            {{-- Display status if verification link was sent (standard session flash) --}}
                            @if (session('status') === 'verification-link-sent')
                                <p class="mt-2 font-medium !dark:text-green-400 !text-green-600">
                                    {{ __('A new verification link has been sent to your email address.') }}
                                </p>
                            @endif
                        </div>
                    @endif
                </div>

                {{-- Save Button --}}
                <div class="flex items-center gap-4 mt-6"> {{-- Added mt-6 for spacing --}}
                    <div class="flex items-center justify-end">
                        <x-button variant="primary" type="submit" class="w-full">
                            {{ __('Save') }}
                        </x-button>
                    </div>
                </div>
            </form>

            {{-- Delete Account Section (remains unchanged, uses minimal Alpine for modal) --}}
            <hr class="my-6 border-zinc-200 dark:border-zinc-700">

            <div x-data="{ confirmingUserDeletion: false }" class="space-y-6">
                <h2 class="text-xl font-semibold">{{ __('Delete Account') }}</h2>
                <h3 class="text-lg font-medium">{{ __('Permanently delete your account.') }}</h3>

                <p>
                    {{ __('Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.') }}
                </p>

                <x-button variant="danger" @click="confirmingUserDeletion = true">
                    {{ __('Delete Account') }}
                </x-button>

                {{-- Confirmation Modal --}}
                <x-modal show="confirmingUserDeletion">
                    <form method="POST" action="{{ route('settings.delete-account') }}" class="p-6">
                        @csrf
                        @method('DELETE')

                        <h2 class="text-lg font-medium">{{ __('Are you sure you want to delete your account?') }}</h2>

                        <p class="mt-4">
                            {{ __('Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.') }}
                        </p>

                        <div class="mt-6">
                            <x-input
                                type="password"
                                name="password"
                                label="{{ __('Password') }}"
                                class="mt-1 block w-3/4"
                                placeholder="{{ __('Password') }}"
                                required
                                autocomplete="current-password"
                            />
                             @error('password', 'userDeletion')
                                <p class="mt-2 text-sm text-red-600">{{ $message }}</p>
                            @enderror
                        </div>

                        <div class="mt-6 flex justify-end">
                            <x-button type="button" variant="subtle" @click="confirmingUserDeletion = false">
                                {{ __('Cancel') }}
                            </x-button>

                            <x-button type="submit" variant="danger" class="ms-3">
                                {{ __('Delete Account') }}
                            </x-button>
                        </div>
                    </form>
                </x-modal>
            </div>

        </x-settings.layout>
    </section>
</x-layouts.app>
