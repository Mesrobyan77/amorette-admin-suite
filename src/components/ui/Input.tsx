import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/utils/format";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name || Math.random().toString(36).slice(2);
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full h-11 px-4 rounded-2xl bg-card text-foreground",
            "border border-border placeholder:text-muted-foreground",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
            "transition-shadow disabled:opacity-60",
            error && "border-destructive focus:ring-destructive/40",
            className,
          )}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-destructive">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    );
  }
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    const tid = id || props.name || Math.random().toString(36).slice(2);
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={tid} className="mb-1.5 block text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <textarea
          id={tid}
          ref={ref}
          rows={4}
          className={cn(
            "w-full px-4 py-3 rounded-2xl bg-card text-foreground border border-border",
            "placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
            error && "border-destructive focus:ring-destructive/40",
            className,
          )}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
