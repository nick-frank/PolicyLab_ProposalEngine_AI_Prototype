"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X, Search } from "lucide-react";

interface ClassCodeSelectProps {
  classCodes: string[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ClassCodeSelect({ classCodes, value, onChange, className }: ClassCodeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedDisplay, setSelectedDisplay] = useState("");
  const [filteredCodes, setFilteredCodes] = useState<string[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value) {
      const found = classCodes.find(c => c.startsWith(value));
      if (found) {
        setSelectedDisplay(found);
      }
    }
  }, [value, classCodes]);

  useEffect(() => {
    if (isOpen) {
      if (search) {
        const filtered = classCodes.filter(code =>
          code.toLowerCase().includes(search.toLowerCase())
        ).slice(0, 100);
        setFilteredCodes(filtered);
      } else {
        // Show first 20 codes when no search
        setFilteredCodes(classCodes.slice(0, 20));
      }
    }
  }, [search, classCodes, isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (code: string) => {
    const codeNumber = code.split(' - ')[0];
    setSelectedDisplay(code);
    onChange(codeNumber);
    setIsOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    setSearch("");
    setSelectedDisplay("");
    onChange("");
    inputRef.current?.focus();
  };

  const handleInputClick = () => {
    setIsOpen(true);
    setSearch("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="relative">
        {isOpen ? (
          <div className="flex items-center">
            <Search className="absolute left-2 h-3 w-3 text-muted-foreground" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${className} pl-7 pr-7`}
              placeholder="Type to search..."
              autoFocus
            />
            <button
              onClick={() => setIsOpen(false)}
              className="absolute right-2 hover:bg-zinc-200 rounded p-0.5"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        ) : (
          <div
            className={`${className} cursor-pointer flex items-center justify-between`}
            onClick={handleInputClick}
          >
            <span className={selectedDisplay ? "text-xs" : "text-xs text-muted-foreground"}>
              {selectedDisplay || "Select class code..."}
            </span>
            <div className="flex items-center gap-1">
              {selectedDisplay && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                  className="hover:bg-zinc-200 rounded p-0.5"
                >
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 w-[500px] mt-1 bg-white border rounded-md shadow-xl max-h-80 overflow-y-auto">
          {filteredCodes.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-muted-foreground">
              {search ? "No matching class codes found" : "No class codes available"}
            </div>
          ) : (
            <>
              <div className="sticky top-0 bg-zinc-50 px-3 py-1 border-b text-xs font-medium text-muted-foreground">
                {search ? `${filteredCodes.length} results` : "Common codes"}
              </div>
              {filteredCodes.map((code, index) => {
                const [codeNum, ...descParts] = code.split(' - ');
                const description = descParts.join(' - ');
                return (
                  <div
                    key={index}
                    className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-zinc-100 group"
                    onClick={() => handleSelect(code)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono font-semibold text-blue-600 group-hover:text-blue-700 min-w-[60px]">
                        {codeNum}
                      </span>
                      <span className="text-xs text-zinc-700 group-hover:text-zinc-900">
                        {description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}
    </div>
  );
}
