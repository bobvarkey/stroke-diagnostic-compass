# Stroke Companion — Agent Notes

## Architecture rules

- **Secondary ICH selections publish a completed/incomplete snapshot to the shared Plan state**; CTA and conditional DSA steps use registered section targets so links activate ICH and mount/open the calculator.
- **Condition tabs stay sticky below the application header**, with horizontally scrollable touch targets on narrow screens; section scrolling reserves space for both bars.

- **Uploaded clinical reference PDFs use asset-pointer URLs and remain original documents**, with open/download links independent of emergency-contact loading so reference access does not require account data.

- **Inner module tabs use the shared `tabColor()` helper** (`src/lib/tabColors.ts`) instead of hand-written per-tab class strings. The helper holds literal Tailwind class strings per colour so the scanner keeps every utility, and its active state includes explicit `dark:*` rules so white text always wins over the dark-mode tinted label. Keep tab bars readable in both themes: inactive = soft tint + matching border + coloured text; active = solid fill + white text.
- **Collapsible module triggers are not always `<button>`s.** `CollapsibleModule` renders its trigger as a `CardHeader` div, some modules use a plain `<button>`, and Radix's collapsible root also carries `data-state`. When driving these open in tests or scripts, click elements matching `[data-state="closed"]` inside the section rather than assuming a `button` selector.
- **Sections that are plain `<div id="...">` wrappers only mount when their condition tab is active.** Activate the owning condition tab first, then scroll the section into view before querying its contents.
