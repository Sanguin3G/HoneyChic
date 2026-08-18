<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ChatbotSetting extends Model
{
    protected $fillable = [
        'api_key',
        'model',
        'base_url',
        'system_prompt',
        'enabled',
    ];

    protected $casts = [
        'api_key' => 'encrypted',
        'enabled' => 'boolean',
    ];
}
