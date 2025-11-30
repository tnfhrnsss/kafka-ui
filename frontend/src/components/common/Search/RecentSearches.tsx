import React from 'react';

import useRecentSearches from './useRecentSearches';
import * as S from './RecentSearches.styled';

interface RecentSearchesProps {
  storageKey?: string;
  maxRecent?: number;
  emptyRecentText?: string;
  isOpen: boolean;
  onSelect: (query: string) => void;
  onClose: () => void;
}

const RecentSearches: React.FC<RecentSearchesProps> = ({
  storageKey,
  maxRecent = 5,
  emptyRecentText = 'No recent searches',
  isOpen,
  onSelect,
  onClose,
}) => {
  const { recent, saveRecent, removeRecent, clearAllRecent, refreshRecent } =
    useRecentSearches({
      storageKey,
      maxRecent,
    });

  React.useEffect(() => {
    if (isOpen && storageKey) {
      refreshRecent();
    }
  }, [isOpen, storageKey, refreshRecent]);

  const handleSelect = (item: string) => {
    saveRecent(item);
    onSelect(item);
    onClose();
  };

  if (!storageKey || !isOpen) {
    return null;
  }

  return (
    <S.Dropdown>
      {recent.length > 0 && (
        <S.DropdownHeader>
          <span>Recent</span>
          <S.ClearAllButton
            onMouseDown={(e) => e.preventDefault()}
            onClick={(e) => {
              e.stopPropagation();
              clearAllRecent();
            }}
            aria-label="Clear all"
            title="Clear all"
          >
            Clear all
          </S.ClearAllButton>
        </S.DropdownHeader>
      )}
      {recent.length === 0 ? (
        <S.EmptyHint>{emptyRecentText}</S.EmptyHint>
      ) : (
        recent.map((item) => (
          <S.DropdownItem key={item} title={item}>
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions,jsx-a11y/click-events-have-key-events */}
            <span
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => handleSelect(item)}
              style={{ flex: 1, minWidth: 0 }}
            >
              {item}
            </span>
            <S.RemoveButton
              aria-label="Remove"
              title="Remove"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.stopPropagation();
                removeRecent(item);
              }}
            >
              ×
            </S.RemoveButton>
          </S.DropdownItem>
        ))
      )}
    </S.Dropdown>
  );
};

export default RecentSearches;
