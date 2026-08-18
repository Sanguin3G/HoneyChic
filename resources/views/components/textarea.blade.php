@props(['label' => null, 'name', 'rows' => 4])

<div {{ $attributes->only('class')->merge(['class' => '']) }}>
    @if($label)<label for="{{ $name }}" class="field-label">{{ $label }}</label>@endif
    <textarea id="{{ $name }}" name="{{ $name }}" rows="{{ $rows }}" {{ $attributes->except(['class', 'label', 'name', 'rows'])->merge(['class' => 'field-control']) }}>{{ old($name, $slot) }}</textarea>
    @error($name)<p class="mt-1.5 text-sm text-red-600">{{ $message }}</p>@enderror
</div>
