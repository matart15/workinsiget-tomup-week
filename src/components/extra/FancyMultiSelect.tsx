import { Command as CommandPrimitive } from 'cmdk';
import { X } from 'lucide-react';
import type { KeyboardEvent } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Badge } from '../ui/badge';
import { Command, CommandGroup, CommandItem } from '../ui/command';

type Framework = Record<'value' | 'label', string>;

export const FancyMultiSelect = ({
  options,
  defaultSelections = [],
  onValueChanged,
}: {
  options: Framework[];
  defaultSelections?: string[];
  onValueChanged: (value: string[]) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues]
    = useState<string[]>(defaultSelections);
  const [inputValue, setInputValue] = useState('');
  useEffect(
    () => {
      onValueChanged(selectedValues);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedValues],
  );
  const handleUnselect = useCallback((value: string) => {
    setSelectedValues(prev => prev.filter(s => s !== value));
  }, []);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const input = inputRef.current;
    if (input) {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (input.value === '') {
          setSelectedValues((prev) => {
            const newSelected = [...prev];
            newSelected.pop();
            return newSelected;
          });
        }
      }
      // This is not a default behaviour of the <input /> field
      if (e.key === 'Escape') {
        input.blur();
      }
    }
  }, []);

  const selectables = options.filter(
    framework => !selectedValues.includes(framework.value),
  );

  return (
    <Command
      onKeyDown={handleKeyDown}
      className="overflow-visible bg-transparent"
    >
      <div className="group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="flex flex-wrap gap-1">
          {selectedValues.map(selectedValue => (
            <Badge key={selectedValue} variant="secondary">
              {options.find(option => option.value === selectedValue)?.label}
              <button
                aria-label="X"
                type="button"
                className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleUnselect(selectedValue);
                  }
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onClick={() => {
                  handleUnselect(selectedValue);
                }}
              >
                <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
              </button>
            </Badge>
          ))}
          {/* Avoid having the "Search" Icon */}
          <CommandPrimitive.Input
            ref={inputRef}
            value={inputValue}
            onValueChange={setInputValue}
            onBlur={() => {
              setOpen(false);
            }}
            onFocus={() => {
              setOpen(true);
            }}
            className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
      <div className="relative mt-2">
        {open && selectables.length > 0
          ? (
              <div className="absolute top-0 z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none animate-in">
                <CommandGroup className="h-full overflow-auto">
                  {selectables.map(framework => (
                    <CommandItem
                      key={framework.value}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onSelect={(_value) => {
                        setInputValue('');
                        setSelectedValues(prev => [...prev, framework.value]);
                      }}
                      className="cursor-pointer"
                    >
                      {framework.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </div>
            )
          : null}
      </div>
    </Command>
  );
};
