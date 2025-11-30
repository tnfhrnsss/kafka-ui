import Search from 'components/common/Search/Search';
import React from 'react';
import { render } from 'lib/testHelpers';
import userEvent from '@testing-library/user-event';
import { screen, fireEvent } from '@testing-library/react';
import { useSearchParams } from 'react-router-dom';

jest.mock('use-debounce', () => ({
  useDebouncedCallback: (fn: (e: Event) => void) => fn,
}));

const setSearchParamsMock = jest.fn();
jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as object),
  useSearchParams: jest.fn(),
}));

const placeholder = 'I am a search placeholder';

describe('Search', () => {
  beforeEach(() => {
    (useSearchParams as jest.Mock).mockImplementation(() => [
      new URLSearchParams(),
      setSearchParamsMock,
    ]);
    setSearchParamsMock.mockClear();
    localStorage.clear();
  });
  it('calls handleSearch on input', async () => {
    render(<Search placeholder={placeholder} />);
    const input = screen.getByPlaceholderText(placeholder);
    await userEvent.click(input);
    await userEvent.keyboard('value');
    expect(setSearchParamsMock).toHaveBeenCalledTimes(5);
  });

  it('when placeholder is provided', () => {
    render(<Search placeholder={placeholder} />);
    expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
  });

  it('when placeholder is not provided', () => {
    render(<Search />);
    expect(screen.queryByPlaceholderText('Search')).toBeInTheDocument();
  });

  it('Clear button is not visible by default', async () => {
    render(<Search placeholder={placeholder} />);

    const clearButton = screen.queryByTestId('search-clear-button');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('Clear button is visible if value passed', async () => {
    render(<Search placeholder={placeholder} value="text" />);

    const clearButton = screen.queryByTestId('search-clear-button');
    expect(clearButton).toBeInTheDocument();
  });

  it('Clear button should clear text from input', async () => {
    render(<Search placeholder={placeholder} />);

    const searchField = screen.getAllByRole('textbox')[0];
    fireEvent.change(searchField, { target: { value: 'hello' } });
    expect(searchField).toHaveValue('hello');

    let clearButton = screen.queryByTestId('search-clear-button');
    expect(clearButton).toBeInTheDocument();
    await userEvent.click(clearButton!);

    expect(searchField).toHaveValue('');

    clearButton = screen.queryByTestId('search-clear-button');
    expect(clearButton).not.toBeInTheDocument();
  });

  it('shows recent searches dropdown when storageKey is provided', async () => {
    const storageKey = 'test-recent-searches';
    const recentSearches = ['search1', 'search2'];
    localStorage.setItem(storageKey, JSON.stringify(recentSearches));

    render(<Search placeholder={placeholder} storageKey={storageKey} />);
    const input = screen.getByPlaceholderText(placeholder);
    await userEvent.click(input);

    expect(screen.getByText('Recent')).toBeInTheDocument();
    expect(screen.getByText('search1')).toBeInTheDocument();
    expect(screen.getByText('search2')).toBeInTheDocument();
  });

  it('applies search when recent search item is clicked', async () => {
    const storageKey = 'test-recent-searches';
    const recentSearches = ['my-search'];
    localStorage.setItem(storageKey, JSON.stringify(recentSearches));

    render(<Search placeholder={placeholder} storageKey={storageKey} />);
    const input = screen.getByPlaceholderText(placeholder);
    await userEvent.click(input);

    const searchItem = screen.getByText('my-search');
    await userEvent.click(searchItem);

    expect(setSearchParamsMock).toHaveBeenCalled();
  });
});
