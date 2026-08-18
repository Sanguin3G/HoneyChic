<div class="fixed bottom-5 right-5 z-50">
    @if($open)
        <section class="mb-3 flex h-[min(70vh,560px)] w-[min(92vw,390px)] flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20" aria-label="LaraStore assistant">
            <header class="flex items-center gap-3 bg-slate-950 px-4 py-4 text-white">
                <span class="flex size-10 items-center justify-center rounded-2xl bg-orange-500"><x-icon name="message-circle" size="21" /></span>
                <div class="min-w-0 flex-1"><p class="font-semibold">LaraStore assistant</p><p class="text-xs text-slate-400">Quick shop help · FAQ first</p></div>
                <button type="button" wire:click="clearChat" class="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Clear chat"><x-icon name="trash" size="16" /></button>
                <button type="button" wire:click="toggle" class="rounded-lg p-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Close chat"><x-icon name="x" size="18" /></button>
            </header>

            <div class="min-h-0 flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4" role="log" aria-live="polite">
                @foreach($messages as $item)
                    <div wire:key="chat-message-{{ $loop->index }}" class="flex {{ $item['role'] === 'user' ? 'justify-end' : 'justify-start' }}">
                        <p class="max-w-[86%] rounded-2xl px-3.5 py-2.5 text-sm leading-6 {{ $item['role'] === 'user' ? 'rounded-br-md bg-orange-600 text-white' : 'rounded-bl-md border border-slate-200 bg-white text-slate-700' }}">{{ $item['content'] }}</p>
                    </div>
                @endforeach
                <div wire:loading wire:target="send,ask" class="flex justify-start"><p class="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-500">Thinking…</p></div>
            </div>

            @if(count($messages) <= 1)
                <div class="flex flex-wrap gap-2 border-t border-slate-100 bg-white px-4 pt-3">
                    <button type="button" wire:click="ask('What are your delivery options?')" class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700">Delivery</button>
                    <button type="button" wire:click="ask('How do returns work?')" class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700">Returns</button>
                    <button type="button" wire:click="ask('What can I shop here?')" class="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-700">Shop categories</button>
                </div>
            @endif

            <form wire:submit.prevent="send" class="flex items-end gap-2 border-t border-slate-200 bg-white p-3">
                <label for="storefront-chat-message" class="sr-only">Ask LaraStore assistant</label>
                <textarea id="storefront-chat-message" wire:model="message" rows="1" maxlength="500" class="field-control max-h-24 resize-none" placeholder="Ask a shop question…"></textarea>
                <button type="submit" wire:loading.attr="disabled" wire:target="send,ask" class="btn btn-primary size-11 shrink-0 rounded-xl p-0" aria-label="Send message"><x-icon name="arrow-right" size="18" /></button>
            </form>
            @error('message')<p class="bg-white px-4 pb-3 text-xs text-red-600">{{ $message }}</p>@enderror
        </section>
    @endif

    <button type="button" wire:click="toggle" class="flex size-14 items-center justify-center rounded-full bg-orange-600 text-white shadow-xl shadow-orange-600/30 transition hover:-translate-y-0.5 hover:bg-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-200" aria-label="{{ $open ? 'Close chat' : 'Open LaraStore assistant' }}" aria-expanded="{{ $open ? 'true' : 'false' }}">
        <x-icon :name="$open ? 'x' : 'message-circle'" size="23" />
    </button>
</div>
