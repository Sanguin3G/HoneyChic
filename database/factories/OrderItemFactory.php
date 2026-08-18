<?php

namespace Database\Factories;

use App\Models\OrderItem;
use App\Models\Order;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderItemFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = OrderItem::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition(): array
    {
        // Get random order and product IDs; provide fallbacks if necessary.
        $orderId = Order::inRandomOrder()->value('id') ?: 1;
        $product = Product::inRandomOrder()->first();
        $productId = $product ? $product->id : 1;
        $price = $product ? $product->price : $this->faker->randomFloat(2, 10, 100);

        return [
            'order_id'   => $orderId,
            'product_id' => $productId,
            'product_name' => $product?->name ?? 'Sample Product',
            'sku' => $product?->sku,
            'quantity'   => $this->faker->numberBetween(1, 5),
            'price'      => $price,
        ];
    }
}
?>
