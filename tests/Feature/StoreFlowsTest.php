<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Livewire\Storefront\CheckoutPage;
use App\Support\CartManager;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Livewire\Livewire;
use Tests\TestCase;

class StoreFlowsTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_admins_can_open_admin_pages(): void
    {
        $customer = User::factory()->create(['role' => 'customer']);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($customer)->get('/admin/products')->assertForbidden();
        $this->actingAs($admin)->get('/admin/products')->assertOk();
    }

    public function test_customer_can_add_to_cart_and_complete_checkout(): void
    {
        $customer = User::factory()->create();
        $category = Category::factory()->create();
        $product = Product::factory()->create([
            'category_id' => $category->id,
            'is_published' => true,
            'stock_quantity' => 3,
            'price' => 12.50,
        ]);

        $this->actingAs($customer);
        app(CartManager::class)->add($product, 2);

        Livewire::test(CheckoutPage::class)
            ->set('name', $customer->name)
            ->set('email', $customer->email)
            ->set('phone', '0123456789')
            ->set('shippingAddress', '123 Store Street')
            ->set('billingAddress', '')
            ->set('paymentMethod', 'Cash on Delivery')
            ->set('notes', '')
            ->call('placeOrder')
            ->assertRedirect(route('orders.show', ['order' => 1]));

        $this->assertDatabaseHas('orders', [
            'user_id' => $customer->id,
            'total_amount' => 25.00,
        ]);
        $this->assertDatabaseHas('order_items', [
            'product_id' => $product->id,
            'quantity' => 2,
            'price' => 12.50,
        ]);
        $this->assertEmpty(session('cart'));
    }
}
