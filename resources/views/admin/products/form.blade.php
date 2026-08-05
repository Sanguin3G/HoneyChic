<x-layouts.admin>
    <div class="flex flex-col gap-6">
         <!-- Session Status Message -->
        @if (session('status'))
            <div class="rounded-md bg-green-50 dark:bg-green-900/20 p-4 border border-green-200 dark:border-green-700">
                <div class="flex">
                    <i class="fas fa-check-circle h-5 w-5 text-green-400 dark:text-green-300"></i>
                    <div class="ml-3">
                        <p class="text-sm font-medium text-green-800 dark:text-green-200">
                            {{ session('status') }}
                        </p>
                    </div>
                </div>
            </div>
        @endif

        <div class="bg-white dark:bg-zinc-800 rounded-xl shadow-md p-6">
             <form method="POST" action="{{ isset($product) ? route('admin.products.update', $product->id) : route('admin.products.store') }}">
                @csrf
                @if(isset($product))
                    @method('PUT')
                @endif
                <div class="p-6 border-b border-zinc-200 dark:border-zinc-700">
                    <h2 class="text-lg font-semibold text-zinc-900 dark:text-white">
                        {{ isset($product) ? 'Edit Product' : 'Create Product' }}
                    </h2>
                    <p class="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {{ isset($product) ? 'Update product information' : 'Add a new product to your store' }}
                    </p>
                </div>

                <div class="p-6">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <!-- Left Column: Basic Info -->
                        <div class="md:col-span-2 space-y-6">
                            <div class="flex flex-col space-y-2">
                                <label for="name" class="text-sm font-medium text-zinc-900 dark:text-white">Product Name</label>
                                <input name="name" id="name" placeholder="Enter product name" required value="{{ old('name', $product->name ?? '') }}" class="block w-full p-2 border border-zinc-200 dark:border-zinc-700 rounded-md focus:ring-0 focus:border-zinc-300" />
                                @error('name')
                                    <p class="text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                                @enderror
                            </div>

                            <div class="flex flex-col space-y-2">
                                <flux:textarea
                                    name="description"
                                    id="description"
                                    label="Description"
                                    placeholder="Enter product description..."
                                    rows="6"
                                    resize="vertical"
                                    :invalid="$errors->has('description')"
                                >{{ old('description', $product->description ?? '') }}</flux:textarea>
                                @error('description')
                                    <p class="text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                                @enderror
                            </div>

                            <div class="flex flex-col space-y-2">
                                <label for="price" class="text-sm font-medium text-zinc-900 dark:text-white">Price</label>
                                <flux:input.group>
                                    <flux:select class="max-w-fit" disabled>
                                        <flux:select.option selected>USD</flux:select.option>
                                    </flux:select>
                                    <flux:input name="price" id="price" type="number" step="0.01" min="0" placeholder="$99.99" required value="{{ old('price', $product->price ?? '') }}" />
                                </flux:input.group>
                                @error('price')
                                    <p class="text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                                @enderror
                            </div>
                        </div>

                        <!-- Right Column: Image, Category, Stock, Status -->
                        <div class="md:col-span-1 space-y-6">
                            <div class="flex flex-col space-y-2">
                                <label for="image_url" class="text-sm font-medium text-zinc-900 dark:text-white">Product Image URL</label>
                                <input name="image_url" id="image_url" placeholder="Paste image URL..." value="{{ old('image_url', $product->image ?? '') }}" class="block w-full p-2 border border-zinc-200 dark:border-zinc-700 rounded-md focus:ring-0 focus:border-zinc-300" />
                                @if(isset($product) && $product->image)
                                    <img src="{{ $product->image }}" alt="Preview" class="mt-2 h-24 w-24 object-cover rounded border border-zinc-200 dark:border-zinc-700" />
                                @endif
                                @error('image_url')
                                    <p class="text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                                @enderror
                            </div>

                            <!-- Category Dropdown with AlpineJS -->
                            <div class="flex flex-col space-y-2" x-data="{
                                open: false,
                                selectedCategory: '{{ old('category_id', $product->category_id ?? '') }}',
                                categoriesMap: {{ Js::from($categories->keyBy('id')->map->name->all() + ['' => 'Select Category']) }}
                            }" @click.outside="open = false">
                                <label for="category-button" class="text-sm font-medium text-zinc-900 dark:text-white">Category</label>
                                <input type="hidden" name="category_id" id="category_id" x-model="selectedCategory">
                                <div class="relative text-sm">
                                    <button @click="open = !open" type="button" id="category-button" class="w-full flex items-center justify-between px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md shadow-sm bg-white dark:bg-zinc-700 text-sm font-medium text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                        <span x-text="categoriesMap[selectedCategory] || 'Select Category'"></span>
                                        <svg class="ml-2 -mr-0.5 h-4 w-4 text-zinc-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                                    </button>
                                    <ul x-show="open"
                                        x-transition:enter="transition ease-out duration-100"
                                        x-transition:enter-start="transform opacity-0 scale-95"
                                        x-transition:enter-end="transform opacity-100 scale-100"
                                        x-transition:leave="transition ease-in duration-75"
                                        x-transition:leave-start="transform opacity-100 scale-100"
                                        x-transition:leave-end="transform opacity-0 scale-95"
                                        class="absolute z-10 mt-1 w-full bg-white dark:bg-zinc-700 shadow-lg rounded-md border border-zinc-200 dark:border-zinc-600 max-h-60 overflow-y-auto py-1"
                                        x-cloak>
                                        <li @click="selectedCategory = ''; open = false" class="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-600 cursor-pointer">
                                            Select Category
                                        </li>
                                        @foreach($categories as $category)
                                            <li @click="selectedCategory = '{{ $category->id }}'; open = false" class="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-600 cursor-pointer">
                                                {{ $category->name }}
                                            </li>
                                        @endforeach
                                    </ul>
                                </div>
                                @error('category_id')
                                    <p class="text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                                @enderror
                            </div>

                            <div class="flex flex-col space-y-2">
                                <label for="stock_quantity" class="text-sm font-medium text-zinc-900 dark:text-white">Stock Quantity</label>
                                <input name="stock_quantity" id="stock_quantity" type="number" min="0" placeholder="0" required value="{{ old('stock_quantity', $product->stock_quantity ?? '') }}" class="block w-full p-2 border border-zinc-200 dark:border-zinc-700 rounded-md focus:ring-0 focus:border-zinc-300" />
                                @error('stock_quantity')
                                    <p class="text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                                @enderror
                            </div>

                            <div class="flex flex-col space-y-2">
                                <label for="is_published" class="text-sm font-medium text-zinc-900 dark:text-white">Status</label>
                                <div class="flex items-center space-x-2">
                                    <input name="is_published" id="is_published" type="checkbox" value="1" @checked(old('is_published', $product->is_published ?? false)) class="rounded-md focus:ring-0 focus:border-zinc-300" /> {{-- Use @checked --}}
                                    <span class="text-sm font-medium text-zinc-900 dark:text-white">Published</span>
                                </div>
                                {{-- No hidden field needed if using $request->has('is_published') in controller --}}
                                @error('is_published')
                                    <p class="text-sm text-red-600 dark:text-red-400">{{ $message }}</p>
                                @enderror
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Form Actions -->
                <div class="p-6 flex items-center justify-end space-x-3 bg-zinc-50 dark:bg-zinc-800 rounded-b-xl border-t border-zinc-200 dark:border-zinc-700">
                    <a href="{{ route('admin.products.index') }}" class="text-sm font-medium text-zinc-900 dark:text-white hover:text-zinc-700 dark:hover:text-zinc-300">Cancel</a>
                    @if (isset($product))
                        <button type="submit" class="text-sm font-medium text-zinc-900 bg-yellow-400 hover:bg-yellow-500 rounded-md px-4 py-2 focus:ring-0 focus:border-zinc-300 flex items-center gap-2">
                            <x-icon name="pencil-square" class="w-4 h-4 text-zinc-900" /> Update Product
                        </button>
                    @else
                        <button type="submit" class="text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-md px-4 py-2 focus:ring-0 focus:border-amber-300 flex items-center gap-2">
                            <x-icon name="plus" class="w-4 h-4 text-white" /> Create Product
                        </button>
                    @endif
                </div>
            </form>
        </div>
    </div>
    <!-- Include AlpineJS if not already included globally -->
    <!-- <script src="//unpkg.com/alpinejs" defer></script> -->
</x-layouts.admin>
