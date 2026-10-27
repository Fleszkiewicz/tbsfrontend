export function FieldLabel({ text, invalid }: { text: string; invalid: boolean }) {
    return (
        <label className="block text-[11px] md:text-[12px] text-gray-400 font-medium mb-1 md:mb-1.5 select-none">
            {text}
            {invalid && <span className="text-red-500 ml-0.5">*</span>}
        </label>
    );
}