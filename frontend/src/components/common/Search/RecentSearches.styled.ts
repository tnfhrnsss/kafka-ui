import styled from 'styled-components';

export const Dropdown = styled.ul`
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
  z-index: 5;
  max-height: 240px;
  overflow-y: auto;
`;

export const DropdownHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid ${({ theme }) => theme.input.borderColor.normal};
  font-size: 12px;
  color: ${({ theme }) => theme.input.color.placeholder.normal};
`;

export const DropdownItem = styled.li`
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

export const RemoveButton = styled.button`
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

export const ClearAllButton = styled.button`
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

export const EmptyHint = styled.li`
  padding: 6px 12px;
  font-size: 12px;
  color: ${({ theme }) => theme.input.color.placeholder.normal};
`;
