<?php

namespace Tests\Feature;

use Tests\TestCase;

class SmokeTest extends TestCase
{
    public function test_home_page_loads_successfully(): void
    {
        $response = $this->get('/');

        $response->assertOk();
    }
}