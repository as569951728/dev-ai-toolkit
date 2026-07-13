import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Link, MemoryRouter, useLocation } from 'react-router-dom';

import { ScrollToTop } from '@/components/layout/scroll-to-top';

function NavigationHarness() {
  const location = useLocation();

  return (
    <>
      <ScrollToTop />
      <p role="status">{`${location.pathname}${location.search}`}</p>
      <Link to="/runs?templateId=template-2">Change filter</Link>
      <Link to="/runs/run-1">Open run</Link>
    </>
  );
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ScrollToTop', () => {
  it('resets scroll for pathname changes without interrupting query filters', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    render(
      <MemoryRouter initialEntries={['/runs?templateId=template-1']}>
        <NavigationHarness />
      </MemoryRouter>,
    );

    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(0, 0));
    scrollTo.mockClear();

    fireEvent.click(screen.getByRole('link', { name: 'Change filter' }));
    expect(screen.getByRole('status')).toHaveTextContent(
      '/runs?templateId=template-2',
    );
    expect(scrollTo).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('link', { name: 'Open run' }));
    expect(screen.getByRole('status')).toHaveTextContent('/runs/run-1');
    await waitFor(() => expect(scrollTo).toHaveBeenCalledWith(0, 0));
  });
});
