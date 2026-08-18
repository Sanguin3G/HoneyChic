<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Order::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition(): array
    {
        // Ensure a valid user_id exists.
        $userId = User::inRandomOrder()->value('id') ?: 1;

        return [
            'user_id'      => $userId,
            // Assuming orders have an order number and a status.
            'order_number' => $this->faker->unique()->numerify('LS-#####'),
            'customer_name' => $this->faker->name(),
            'customer_email' => $this->faker->safeEmail(),
            'customer_phone' => $this->faker->numerify('09########'),
            'status'       => $this->faker->randomElement(['pending', 'completed', 'cancelled']),
            'subtotal'     => $total = $this->faker->randomFloat(2, 20, 500),
            'shipping_amount' => 0,
            'total_amount' => $total,
            'payment_method' => 'Cash on Delivery',
            'payment_status' => 'pending',
            'created_at'   => $this->faker->dateTime(),
            'updated_at'   => now(),
        ];
    }
}
?>
