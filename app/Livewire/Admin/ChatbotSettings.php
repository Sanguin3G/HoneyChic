<?php

namespace App\Livewire\Admin;

use App\Models\ChatbotSetting;
use Livewire\Component;

class ChatbotSettings extends Component
{
    public string $apiKey = '';
    public string $model = '';
    public string $baseUrl = '';
    public string $systemPrompt = '';
    public bool $enabled = true;
    public bool $hasStoredKey = false;
    public string $savedMessage = '';

    public function mount(): void
    {
        $this->authorizeAdmin();

        $settings = ChatbotSetting::query()->first();
        $this->model = $settings?->model ?: config('services.larastore_chatbot.model', 'gpt-4o-mini');
        $this->baseUrl = $settings?->base_url ?: config('services.larastore_chatbot.base_url', 'https://api.openai.com/v1');
        $this->systemPrompt = $settings?->system_prompt ?? '';
        $this->enabled = $settings?->enabled ?? true;
        $this->hasStoredKey = filled($settings?->api_key);
    }

    public function save(): void
    {
        $this->authorizeAdmin();
        $this->savedMessage = '';

        $this->validate([
            'apiKey' => ['nullable', 'string', 'max:500'],
            'model' => ['required', 'string', 'max:100'],
            'baseUrl' => ['required', 'url:http,https', 'max:255'],
            'systemPrompt' => ['nullable', 'string', 'max:4000'],
            'enabled' => ['boolean'],
        ]);

        $values = [
            'model' => trim($this->model),
            'base_url' => rtrim(trim($this->baseUrl), '/'),
            'system_prompt' => trim($this->systemPrompt) ?: null,
            'enabled' => $this->enabled,
        ];

        if (filled($this->apiKey)) {
            $values['api_key'] = trim($this->apiKey);
        }

        $settings = ChatbotSetting::query()->firstOrNew(['id' => 1]);
        $settings->fill($values);
        $settings->save();

        $this->apiKey = '';
        $this->hasStoredKey = filled($settings->api_key);
        $this->savedMessage = 'Chatbot settings saved. The API key is stored encrypted and will not be shown again.';
    }

    public function clearApiKey(): void
    {
        $this->authorizeAdmin();
        ChatbotSetting::query()->first()?->update(['api_key' => null]);
        $this->apiKey = '';
        $this->hasStoredKey = false;
        $this->savedMessage = 'The saved API key was cleared. The local FAQ assistant remains available.';
    }

    private function authorizeAdmin(): void
    {
        abort_unless(auth()->user()?->isAdmin(), 403);
    }

    public function render()
    {
        return view('livewire.admin.chatbot-settings')
            ->layout('components.layouts.admin', ['title' => 'Chatbot settings']);
    }
}
