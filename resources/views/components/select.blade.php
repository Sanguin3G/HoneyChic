@props(['name', 'label' => null])

<div {{ $attributes->only('class')->merge(['class' => '']) }}>
    @if($label)<label for="{{ $name }}" class="field-label">{{ $label }}</label>@endif
    <select id="{{ $name }}" name="{{ $name }}" {{ $attributes->except(['class', 'name', 'label'])->merge(['class' => 'field-control']) }}>{{ $slot }}</select>
    @error($name)<p class="mt-1.5 text-sm text-red-600">{{ $message }}</p>@enderror
</div>
