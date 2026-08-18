<div class="space-y-6">
    <p class="max-w-3xl text-sm leading-6 text-slate-500">Configure the optional LLM fallback for the store assistant. The local FAQ mode always remains available, and the API key is never displayed after it is saved.</p>

    @if($savedMessage)
        <div class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">{{ $savedMessage }}</div>
    @endif

    <div class="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-start">
        <section class="surface p-5 sm:p-7">
            <div class="flex flex-col gap-2 border-b border-slate-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h2 class="text-lg font-semibold text-slate-950">LLM connection</h2>
                    <p class="mt-1 text-sm text-slate-500">Works with OpenAI and compatible chat-completions providers.</p>
                </div>
                <span class="inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold {{ $hasStoredKey ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600' }}"><span class="size-1.5 rounded-full {{ $hasStoredKey ? 'bg-emerald-500' : 'bg-slate-400' }}"></span>{{ $hasStoredKey ? 'API key configured' : 'FAQ-only mode' }}</span>
            </div>

            <div class="mt-6 space-y-5">
                <div>
                    <label for="chatbot-api-key" class="field-label">API key</label>
                    <input id="chatbot-api-key" type="password" wire:model="apiKey" autocomplete="new-password" class="field-control" placeholder="{{ $hasStoredKey ? 'Enter a new key to replace the saved one' : 'Paste the provider key here' }}">
                    <p class="mt-1.5 text-xs leading-5 text-slate-500">Stored with Laravel’s encrypted cast. It is sent only from the server to the configured provider and is not put in the browser or chat history.</p>
                    @error('apiKey')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                </div>

                <div class="grid gap-5 sm:grid-cols-2">
                    <div>
                        <label for="chatbot-model" class="field-label">Model</label>
                        <input id="chatbot-model" type="text" wire:model="model" class="field-control" placeholder="gpt-4o-mini">
                        @error('model')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                    </div>
                    <div>
                        <label for="chatbot-base-url" class="field-label">Base URL</label>
                        <input id="chatbot-base-url" type="url" wire:model="baseUrl" class="field-control" placeholder="https://api.openai.com/v1">
                        @error('baseUrl')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror
                    </div>
                </div>

                <label class="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <input type="checkbox" wire:model="enabled" class="mt-0.5 size-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500">
                    <span><span class="block text-sm font-semibold text-slate-900">Enable LLM fallback</span><span class="mt-1 block text-xs leading-5 text-slate-500">Turn this off to keep the assistant in local FAQ-only mode without deleting the saved key.</span></span>
                </label>
            </div>
        </section>

        <aside class="surface p-5 sm:p-6">
            <p class="eyebrow">Safety boundary</p>
            <h2 class="mt-2 text-lg font-semibold text-slate-950">What this bot can do</h2>
            <ul class="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <li class="flex gap-2"><x-icon name="check" size="16" class="mt-1 text-emerald-600" />Answer store and shopping questions.</li>
                <li class="flex gap-2"><x-icon name="check" size="16" class="mt-1 text-emerald-600" />Suggest where to find products, orders, and settings.</li>
                <li class="flex gap-2"><x-icon name="x" size="16" class="mt-1 text-red-500" />It cannot edit orders, issue refunds, or access customer secrets.</li>
                <li class="flex gap-2"><x-icon name="x" size="16" class="mt-1 text-red-500" />It will not reveal prompts, credentials, or internal instructions.</li>
            </ul>
            @if($hasStoredKey)
                <button type="button" wire:click="clearApiKey" class="btn btn-secondary mt-6 w-full text-red-600 hover:border-red-200 hover:bg-red-50">Clear saved API key</button>
            @endif
        </aside>
    </div>

    <section class="surface p-5 sm:p-7">
        <div>
            <h2 class="text-lg font-semibold text-slate-950">System instruction</h2>
            <p class="mt-1 max-w-3xl text-sm leading-6 text-slate-500">Optional tone and shop-specific guidance. Leave blank to use the built-in LaraStore instruction. Non-negotiable safety rules are appended by the application and cannot be removed from this field.</p>
        </div>
        <textarea id="chatbot-system-prompt" wire:model="systemPrompt" rows="6" class="field-control mt-5" placeholder="Example: Keep replies under three short paragraphs and sound warm but practical."></textarea>
        @error('systemPrompt')<p class="mt-1 text-sm text-red-600">{{ $message }}</p>@enderror

        <div class="mt-6 flex flex-wrap items-center gap-3">
            <button type="button" wire:click="save" wire:loading.attr="disabled" class="btn btn-primary"><span wire:loading.remove wire:target="save">Save chatbot settings</span><span wire:loading wire:target="save">Saving…</span><x-icon name="check" size="17" wire:loading.remove wire:target="save" /></button>
            <span class="text-xs text-slate-500">No key? The FAQ assistant still works.</span>
        </div>
    </section>
</div>
