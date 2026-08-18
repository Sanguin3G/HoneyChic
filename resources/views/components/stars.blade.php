@props(['rating' => 0])
<span class="inline-flex items-center gap-0.5 text-amber-500" aria-label="{{ $rating }} out of 5 stars">
    @for($i = 1; $i <= 5; $i++)<x-icon name="star" size="14" class="{{ $i <= $rating ? 'fill-current' : 'text-slate-300' }}" />@endfor
</span>
