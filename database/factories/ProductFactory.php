<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ProductFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array
     */
    public function definition(): array
    {
        $categoryId = Category::query()->inRandomOrder()->value('id');
        $name = Str::title($this->faker->unique()->words(3, true));

        return [
            'name'        => $name,
            'slug'        => Str::slug($name),
            'price'       => $this->faker->randomFloat(2, 10, 200),
            'description' => $this->faker->paragraph,
            'image'       => null,
            'category_id' => $categoryId,
            'stock_quantity' => $this->faker->numberBetween(0, 100),
            'is_published' => true,
            'is_featured' => $this->faker->boolean(20),
            'sku' => strtoupper($this->faker->unique()->bothify('SKU-####')),
        ];
    }
}
