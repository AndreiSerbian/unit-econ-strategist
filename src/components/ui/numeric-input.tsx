import { memo, useCallback, useState, useRef, useEffect } from "react";
import { Input } from "./input";

interface NumericInputProps {
  id?: string;
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  step?: string;
  className?: string;
  allowNull?: boolean;
}

export const NumericInput = memo(({ 
  id, 
  value, 
  onChange, 
  placeholder = "0",
  step,
  className,
  allowNull = false
}: NumericInputProps) => {
  const [localValue, setLocalValue] = useState(value?.toString() ?? "");
  const inputRef = useRef<HTMLInputElement>(null);
  const isFocused = useRef(false);
  
  // Синхронизируем локальное значение с внешним только когда input не в фокусе
  useEffect(() => {
    if (!isFocused.current) {
      setLocalValue(value?.toString() ?? "");
    }
  }, [value]);

  const handleFocus = useCallback(() => {
    isFocused.current = true;
  }, []);

  const handleBlur = useCallback(() => {
    isFocused.current = false;
    
    if (localValue === '' || localValue === null) {
      onChange(allowNull ? null : 0);
    } else {
      const numValue = parseFloat(localValue);
      if (isNaN(numValue)) {
        onChange(allowNull ? null : 0);
      } else {
        onChange(numValue);
      }
    }
  }, [localValue, onChange, allowNull]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalValue(e.target.value);
  }, []);

  return (
    <Input
      ref={inputRef}
      id={id}
      type="number"
      step={step}
      value={localValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
    />
  );
});

NumericInput.displayName = "NumericInput";
