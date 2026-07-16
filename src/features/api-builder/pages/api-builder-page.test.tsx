import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';

import { ApiBuilderPage } from '@/features/api-builder/pages/api-builder-page';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function LocationProbe() {
  const location = useLocation();

  return (
    <>
      <div data-testid="location-pathname">{location.pathname}</div>
      <div data-testid="location-search">{location.search}</div>
      <div data-testid="location-state">{JSON.stringify(location.state)}</div>
    </>
  );
}

function renderApiBuilderPage() {
  render(
    <MemoryRouter initialEntries={['/api-builder']}>
      <Routes>
        <Route path="/api-builder" element={<ApiBuilderPage />} />
        <Route path="/code-viewer" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ApiBuilderPage', () => {
  it('updates the resolved URL and resets the request draft', () => {
    renderApiBuilderPage();

    expect(
      screen.getByRole('heading', {
        name: 'Shape API requests before you wire them into code.',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Build URLs, query params, headers, and request payloads in one place, then review the generated fetch snippet or cURL command.',
      ),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Base URL'), {
      target: { value: '/api/prompts?limit=10' },
    });

    expect(
      screen.getByText('/api/prompts?limit=10&workspace=dev-ai-toolkit'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));

    expect(
      screen.getByText('Add a base URL to preview the final request URL.'),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('HTTP method')).toHaveValue('GET');
    expect(screen.getByText('No request body')).toBeInTheDocument();
  });

  it('shows a curl command preview for the current request draft', () => {
    renderApiBuilderPage();

    expect(
      screen.getByRole('heading', { name: 'cURL command' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) =>
        content.includes(
          "curl -X POST 'https://api.example.com/v1/prompts/render?workspace=dev-ai-toolkit'",
        ),
      ),
    ).toBeInTheDocument();
  });

  it('keeps but omits a JSON body when the method changes to GET', () => {
    renderApiBuilderPage();

    fireEvent.change(screen.getByLabelText('HTTP method'), {
      target: { value: 'GET' },
    });

    expect(screen.getByLabelText('JSON body')).not.toHaveValue('');
    expect(screen.getByRole('status')).toHaveTextContent(
      'GET requests cannot include a body in browser fetch.',
    );
    expect(screen.getByText('Request body omitted')).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes("method: 'GET'")),
    ).not.toHaveTextContent('body:');
    expect(
      screen.getByText((content) => content.includes('curl -X GET')),
    ).not.toHaveTextContent('--data-raw');
  });

  it('labels query and header pair controls for assistive technology', () => {
    renderApiBuilderPage();

    expect(
      screen.getByRole('textbox', { name: 'Query params key 1' }),
    ).toHaveValue('workspace');
    expect(
      screen.getByRole('textbox', { name: 'Query params value 1' }),
    ).toHaveValue('dev-ai-toolkit');
    expect(
      screen.getByRole('textbox', { name: 'Headers key 1' }),
    ).toHaveValue('Authorization');
    expect(
      screen.getByRole('textbox', { name: 'Headers value 1' }),
    ).toHaveValue('Bearer <token>');
    expect(
      screen.getByRole('button', { name: 'Add Query params row' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add Headers row' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Remove Query params row 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Remove Headers row 1' }),
    ).toBeInTheDocument();
  });

  it('copies the generated curl command and announces the result', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    renderApiBuilderPage();

    fireEvent.click(
      screen.getByRole('button', { name: 'Copy cURL command' }),
    );

    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining(
        "curl -X POST 'https://api.example.com/v1/prompts/render?workspace=dev-ai-toolkit'",
      ),
    );
    expect(await screen.findByRole('status')).toHaveTextContent(
      'cURL command copied.',
    );
  });

  it('announces curl copy failures when the clipboard is unavailable', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });

    renderApiBuilderPage();

    fireEvent.click(
      screen.getByRole('button', { name: 'Copy cURL command' }),
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Failed to copy cURL command.',
    );
  });

  it('links the generated curl command to Code Viewer', () => {
    renderApiBuilderPage();

    fireEvent.click(
      screen.getByRole('link', { name: 'Open cURL in Code Viewer' }),
    );
    const state = JSON.parse(
      screen.getByTestId('location-state').textContent ?? 'null',
    ) as {
      codeViewer: {
        left: string;
        mode: string;
        language: string;
      };
    };

    expect(screen.getByTestId('location-pathname')).toHaveTextContent(
      '/code-viewer',
    );
    expect(screen.getByTestId('location-search')).toBeEmptyDOMElement();
    expect(state.codeViewer.mode).toBe('single');
    expect(state.codeViewer.language).toBe('bash');
    expect(state.codeViewer.left).toContain(
      "curl -X POST 'https://api.example.com/v1/prompts/render?workspace=dev-ai-toolkit'",
    );
  });

  it('links the generated fetch snippet to Code Viewer', () => {
    renderApiBuilderPage();

    fireEvent.click(
      screen.getByRole('link', { name: 'Open fetch in Code Viewer' }),
    );
    const state = JSON.parse(
      screen.getByTestId('location-state').textContent ?? 'null',
    ) as {
      codeViewer: {
        left: string;
        mode: string;
        language: string;
      };
    };

    expect(screen.getByTestId('location-pathname')).toHaveTextContent(
      '/code-viewer',
    );
    expect(screen.getByTestId('location-search')).toBeEmptyDOMElement();
    expect(state.codeViewer.mode).toBe('single');
    expect(state.codeViewer.language).toBe('javascript');
    expect(state.codeViewer.left).toContain(
      "fetch('https://api.example.com/v1/prompts/render?workspace=dev-ai-toolkit'",
    );
  });
});
