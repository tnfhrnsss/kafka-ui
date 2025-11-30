import React, {
  ComponentRef,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useDebouncedCallback } from 'use-debounce';
import Input from 'components/common/Input/Input';
import { useSearchParams } from 'react-router-dom';
import CloseCircleIcon from 'components/common/Icons/CloseCircleIcon';

import * as S from './Search.styled';
import RecentSearches from './RecentSearches';
import useRecentSearches from './useRecentSearches';

interface SearchProps {
  placeholder?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
  value?: string;
  extraActions?: ReactNode;
  storageKey?: string;
  maxRecent?: number;
  persistOnType?: boolean;
  emptyRecentText?: string;
}

const Search: React.FC<SearchProps> = ({
  placeholder = 'Search',
  disabled = false,
  value,
  onChange,
  extraActions,
  storageKey,
  maxRecent = 5,
  persistOnType = true,
  emptyRecentText = 'No recent searches',
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const ref = useRef<ComponentRef<'input'>>(null);
  const [showIcon, setShowIcon] = useState(!!value || !!searchParams.get('q'));
  const [isOpen, setIsOpen] = useState(false);

  const { saveRecent, refreshRecent } = useRecentSearches({
    storageKey,
    maxRecent,
  });

  useEffect(() => {
    if (ref.current !== null && value) {
      ref.current.value = value;
    }
  }, [value]);

  const handleChange = useDebouncedCallback((e) => {
    setShowIcon(!!e.target.value);
    if (ref.current != null) {
      ref.current.value = e.target.value;
    }

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

  const handleFocus = () => {
    if (!disabled) {
      const current = ref.current?.value || '';
      setIsOpen(current.length === 0);
    }
  };

  const handleBlur = () => {
    if (persistOnType && ref.current) {
      saveRecent(ref.current.value || '');
    }
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

  const clearSearchValue = () => {
    if (ref.current != null) {
      ref.current.value = '';
    }

    if (onChange) {
      onChange('');
    } else if (searchParams.get('q')) {
      searchParams.set('q', '');
      setSearchParams(searchParams);
    }

    setShowIcon(false);

    if (!disabled) {
      refreshRecent();
      setIsOpen(true);
    }
  };

  return (
    <S.Container>
      <Input
        type="text"
        placeholder={placeholder}
        onChange={handleChange}
        defaultValue={value || searchParams.get('q') || ''}
        inputSize="M"
        disabled={disabled}
        ref={ref}
        search
        actions={
          <S.Actions>
            {showIcon && (
              <S.IconButtonWrapper
                onClick={clearSearchValue}
                data-testid="search-clear-button"
              >
                <CloseCircleIcon />
              </S.IconButtonWrapper>
            )}

            {extraActions}
          </S.Actions>
        }
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
      />
      <RecentSearches
        storageKey={storageKey}
        maxRecent={maxRecent}
        emptyRecentText={emptyRecentText}
        isOpen={isOpen}
        onSelect={applySearch}
        onClose={() => setIsOpen(false)}
      />
    </S.Container>
  );
};

export default Search;
