"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Send, FileText, X } from "lucide-react";
import { FORMS_CATALOG, type FormsCatalogEntry } from "@/lib/mock-data";

interface ChatInputProps {
  onSend: (message: string, selectedForm?: { formNumber: string; formName: string }) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");
  const [showFormSelector, setShowFormSelector] = useState(false);
  const [formSearch, setFormSearch] = useState("");
  const [selectedForm, setSelectedForm] = useState<FormsCatalogEntry | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formDropdownRef = useRef<HTMLDivElement>(null);

  const filteredForms = formSearch.trim()
    ? FORMS_CATALOG.filter(
        (f) =>
          f.formNumber.toLowerCase().includes(formSearch.toLowerCase()) ||
          f.formName.toLowerCase().includes(formSearch.toLowerCase())
      ).slice(0, 8)
    : FORMS_CATALOG.slice(0, 8);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed && !selectedForm) return;

    const message = trimmed || `Find claims associated with form ${selectedForm!.formNumber}`;
    onSend(
      message,
      selectedForm
        ? { formNumber: selectedForm.formNumber, formName: selectedForm.formName }
        : undefined
    );
    setText("");
    setSelectedForm(null);
    setShowFormSelector(false);
    setFormSearch("");
  }, [text, selectedForm, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectForm = (form: FormsCatalogEntry) => {
    setSelectedForm(form);
    setText(`Which claims are associated with form ${form.formNumber} (${form.formName})?`);
    setShowFormSelector(false);
    setFormSearch("");
    textareaRef.current?.focus();
  };

  const handleClearForm = () => {
    setSelectedForm(null);
    setText("");
    textareaRef.current?.focus();
  };

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }, [text]);

  // Close form dropdown on click outside
  useEffect(() => {
    if (!showFormSelector) return;
    const handler = (e: MouseEvent) => {
      if (
        formDropdownRef.current &&
        !formDropdownRef.current.contains(e.target as Node)
      ) {
        setShowFormSelector(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showFormSelector]);

  return (
    <div className="relative">
      {/* Form selector dropdown */}
      {showFormSelector && (
        <div
          ref={formDropdownRef}
          className="absolute bottom-full left-0 right-0 mb-2 bg-background border rounded-lg shadow-lg z-10 max-h-80 overflow-hidden"
        >
          <div className="p-2 border-b">
            <Input
              placeholder="Search forms by number or name..."
              value={formSearch}
              onChange={(e) => setFormSearch(e.target.value)}
              autoFocus
              className="h-8 text-sm"
            />
          </div>
          <div className="overflow-y-auto max-h-60">
            {filteredForms.length === 0 ? (
              <p className="p-3 text-xs text-muted-foreground text-center">
                No forms found
              </p>
            ) : (
              filteredForms.map((form) => (
                <button
                  key={form.formNumber}
                  onClick={() => handleSelectForm(form)}
                  className="w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors border-b last:border-b-0"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs flex-shrink-0">
                      {form.formNumber}
                    </Badge>
                    <span className="text-xs truncate">{form.formName}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Selected form badge */}
      {selectedForm && (
        <div className="flex items-center gap-1.5 mb-2">
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
            <FileText className="h-3 w-3 mr-1" />
            {selectedForm.formNumber} - {selectedForm.formName}
          </Badge>
          <button
            onClick={handleClearForm}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="flex-shrink-0 h-9 w-9"
          onClick={() => setShowFormSelector(!showFormSelector)}
          title="Search by form"
        >
          <FileText className="h-4 w-4" />
        </Button>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search claims by keyword, category, or ask a question..."
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-lg border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
        <Button
          size="icon"
          className="flex-shrink-0 h-9 w-9"
          onClick={handleSend}
          disabled={disabled || (!text.trim() && !selectedForm)}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
