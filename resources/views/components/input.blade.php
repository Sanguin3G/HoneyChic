@props(['label' => null, 'name', 'value' => null, 'type' => 'text', 'hint' => null])

<div {{ $attributes->only('class')->merge(['class' => '']) }}>
    @if($label)<label for="{{ $name }}" class="field-label">{{ $label }}</label>@endif
    <input id="{{ $name }}" name="{{ $name }}" type="{{ $type }}" value="{{ old($name, $value) }}" {{ $attributes->except(['class', 'name', 'value', 'type', 'label', 'hint'])->merge(['class' => 'field-control']) }} />
    @if($hint)<p class="mt-1.5 text-xs text-slate-500">{{ $hint }}</p>@endif
    @error($name)<p class="mt-1.5 text-sm text-red-600">{{ $message }}</p>@enderror
</div>
