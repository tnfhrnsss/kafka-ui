import React, { ComponentRef, useEffect, useRef, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import Input from 'components/common/Input/Input';
import { useSearchParams } from 'react-router-dom';
import CloseCircleIcon from 'components/common/Icons/CloseCircleIcon';
import styled from 'styled-components';

interface SearchProps {
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  value?: string;
  storageKey?: string; // for recent searches per context (e.g., topics per cluster)
  maxRecent?: number;
  // If false, component will not persist typed/blurred queries into recent storage
  // Useful when recent suggestions are managed elsewhere (e.g., selected topic names)
  persistOnType?: boolean;
  emptyRecentText?: string;
}

const IconButtonWrapper = styled.span.attrs(() => ({
  role: 'button',
  tabIndex: 0,
}))`
  height: 16px !important;
  display: inline-block;
  &:hover {
    cursor: pointer;
  }
`;
const Container = styled.div`
  position: relative;
`;

const Dropdown = styled.ul`
  position: absolute;
  top: 36px;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.input.backgroundColor.normal};
  border: 1px solid ${({ theme }) => theme.input.borderColor.normal};
  border-radius: 4px;
  padding: 4px 0;
  margin: 4px 0 0 0;
  list-style: none;
  z-index: 10;
  max-height: 240px;
  overflow-y: auto;
`;

const DropdownHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.input.borderColor.normal};
  font-size: 12px;
  color: ${({ theme }) => theme.input.color.placeholder.normal};
`;

const DropdownItem = styled.li`
  padding: 6px 12px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  &:hover {
    background: ${({ theme }) => theme.table.tr.backgroundColor.hover};
  }
`;

const RemoveButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.input.color.placeholder.normal};
  cursor: pointer;
  border-radius: 3px;
  &:hover {
    background: ${({ theme }) => theme.table.tr.backgroundColor.hover};
  }
`;

const ClearAllButton = styled.button`
  border: none;
  background: transparent;
  color: ${({ theme }) => theme.link.color};
  font-size: 12px;
  cursor: pointer;
  padding: 2px 4px;
  border-radius: 3px;
  &:hover {
    text-decoration: underline;
    background: ${({ theme }) => theme.table.tr.backgroundColor.hover};
  }
`;

const EmptyHint = styled.li`
  padding: 6px 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.input.color.placeholder.normal};
`;

const Search: React.FC<SearchProps> = ({
  placeholder = 'Search',
  disabled = false,
  value,
  onChange,
  storageKey,
  maxRecent = 5,
  persistOnType = true,
  emptyRecentText = 'No recent searches',
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const ref = useRef<ComponentRef<'input'>>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    if (ref.current !== null && value) {
      ref.current.value = value;
    }
  }, [value]);

  const handleChange = useDebouncedCallback((e) => {
    if (ref.current != null) {
      ref.current.value = e.target.value;
    }
    // Hide recent list while typing non-empty value
    if (!disabled) {
      const val = String(e.target.value || '');
      if (val.length > 0) {
        setIsOpen(false);
      }
    }
    if (onChange) {
      onChange(e.target.value);
    } else {
      searchParams.set('q', e.target.value);
      if (searchParams.get('page')) {
        searchParams.set('page', '1');
      }
      setSearchParams(searchParams);
    }
  }, 500);

  const loadRecent = () => {
    if (!storageKey) return [] as string[];
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr.filter((s) => typeof s === 'string') : [];
    } catch {
      return [];
    }
  };

  const saveRecent = (q: string) => {
    if (!storageKey) return;
    const trimmed = q.trim();
    if (!trimmed) return;
    const next = [trimmed, ...loadRecent().filter((s) => s !== trimmed)].slice(
      0,
      maxRecent
    );
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setRecent(next);
    } catch {}
  };

  const handleFocus = () => {
    if (!disabled) {
      setRecent(loadRecent());
      // Only show recent list if input is empty on focus
      const current = ref.current?.value || '';
      setIsOpen(current.length === 0);
    }
  };

  const handleBlur = () => {
    // Save current value as recent on blur
    if (persistOnType && ref.current) {
      saveRecent(ref.current.value || '');
    }
    // Delay closing to allow click on dropdown items
    setTimeout(() => setIsOpen(false), 150);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === 'Enter' && ref.current) {
      if (persistOnType) {
        saveRecent(ref.current.value || '');
      }
      setIsOpen(false);
    }
  };

  const applySearch = (q: string) => {
    if (ref.current) {
      ref.current.value = q;
    }
    if (onChange) {
      onChange(q);
    } else {
      searchParams.set('q', q);
      if (searchParams.get('page')) {
        searchParams.set('page', '1');
      }
      setSearchParams(searchParams);
    }
  };

  const removeRecent = (item: string) => {
    if (!storageKey) return;
    try {
      const next = loadRecent().filter((s) => s !== item);
      localStorage.setItem(storageKey, JSON.stringify(next));
      setRecent(next);
    } catch {}
  };

  const clearAllRecent = () => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify([]));
      setRecent([]);
    } catch {}
  };

  const clearSearchValue = () => {
    if (onChange) {
      onChange('');
    } else if (searchParams.get('q')) {
      searchParams.set('q', '');
      setSearchParams(searchParams);
    }
    if (ref.current != null) {
      ref.current.value = '';
    }
    if (onChange) {
      onChange('');
    }
    // After clearing, reopen recent list
    if (!disabled) {
      setRecent(loadRecent());
      setIsOpen(true);
    }
  };

  return (
    <Container>
      <Input
        type="text"
        placeholder={placeholder}
        onChange={handleChange}
        defaultValue={value || searchParams.get('q') || ''}
        inputSize="M"
        disabled={disabled}
        ref={ref}
        search
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        clearIcon={
          <IconButtonWrapper onClick={clearSearchValue}>
            <CloseCircleIcon />
          </IconButtonWrapper>
        }
      />
      {storageKey && isOpen && (
        <Dropdown>
          {recent.length > 0 && (
            <DropdownHeader>
              <span>Recent</span>
              <ClearAllButton
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  clearAllRecent();
                }}
                aria-label="Clear all"
                title="Clear all"
              >
                Clear all
              </ClearAllButton>
            </DropdownHeader>
          )}
          {recent.length === 0 ? (
            <EmptyHint>{emptyRecentText}</EmptyHint>
          ) : (
            recent.map((item) => (
              <DropdownItem key={item} title={item}>
                <span
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    saveRecent(item);
                    applySearch(item);
                    setIsOpen(false);
                  }}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  {item}
                </span>
                <RemoveButton
                  aria-label="Remove"
                  title="Remove"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRecent(item);
                  }}
                >
                  ×
                </RemoveButton>
              </DropdownItem>
            ))
          )}
        </Dropdown>
      )}
    </Container>
  );
};

export default Search;
