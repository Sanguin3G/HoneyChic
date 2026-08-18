<?php

namespace App\Livewire\Storefront;

use App\Support\StoreAssistant;
use Illuminate\Support\Facades\RateLimiter;
use Livewire\Component;

class Chatbot extends Component
{
    public bool $open = false;
    public string $message = '';
    public array $messages = [];

    public function mount(): void
    {
        $stored = session('chatbot.messages', []);
        $this->messages = $this->normaliseMessages(is_array($stored) ? $stored : []);

        if ($this->messages === []) {
            $this->messages = [[
                'role' => 'assistant',
                'content' => 'Hi! I’m the LaraStore assistant. Ask me about products, delivery, returns, checkout, or orders.',
            ]];
        }
    }

    public function toggle(): void
    {
        $this->open = ! $this->open;
    }

    public function send(): void
    {
        $this->validate([
            'message' => ['required', 'string', 'max:500'],
        ]);

        $message = trim($this->message);
        $history = $this->messages;
        $this->messages[] = ['role' => 'user', 'content' => $message];

        $rateLimitKey = 'larastore-chatbot:'.(request()->ip() ?: 'unknown').':'.session()->getId();

        if (RateLimiter::tooManyAttempts($rateLimitKey, 12)) {
            $this->messages[] = [
                'role' => 'assistant',
                'content' => 'You have reached the short chat limit. Please wait a minute and try again.',
            ];
        } else {
            RateLimiter::hit($rateLimitKey, 60);
            $this->messages[] = [
                'role' => 'assistant',
                'content' => app(StoreAssistant::class)->reply($message, $history),
            ];
        }

        $this->messages = array_slice($this->messages, -12);
        $this->message = '';
        $this->persistMessages();
    }

    public function ask(string $prompt): void
    {
        $this->message = $prompt;
        $this->send();
    }

    public function clearChat(): void
    {
        $this->messages = [[
            'role' => 'assistant',
            'content' => 'Chat cleared. What would you like to know about LaraStore?',
        ]];
        $this->persistMessages();
    }

    private function persistMessages(): void
    {
        session()->put('chatbot.messages', $this->messages);
    }

    private function normaliseMessages(array $messages): array
    {
        return collect($messages)
            ->filter(fn ($item) => is_array($item) && in_array($item['role'] ?? null, ['user', 'assistant'], true) && filled($item['content'] ?? null))
            ->map(fn (array $item) => [
                'role' => $item['role'],
                'content' => trim((string) $item['content']),
            ])
            ->slice(-12)
            ->values()
            ->all();
    }

    public function render()
    {
        return view('livewire.storefront.chatbot');
    }
}
