import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import EasyPlayer from '..';

describe('EasyPlayer', () => {
  it('should render placeholder when no url provided', () => {
    render(<EasyPlayer />);
    expect(screen.getByText('No signal')).toBeDefined();
  });

  it('should accept className prop', () => {
    const { container } = render(<EasyPlayer className="custom-player" />);
    expect(container.firstChild).toHaveClass('custom-player');
  });

  it('should accept style prop', () => {
    const style = { width: '100%', height: '400px' };
    const { container } = render(<EasyPlayer style={style} />);
    expect(container.firstChild).toHaveAttribute('style');
  });

  it('should accept noSignalText prop', () => {
    render(<EasyPlayer noSignalText="播放器加载中" />);
    expect(screen.getByText('播放器加载中')).toBeDefined();
  });

  it('should render with url attribute', () => {
    const testUrl = 'https://example.com/stream.m3u8';
    const { container } = render(<EasyPlayer url={testUrl} />);
    expect(container.firstChild).toHaveAttribute('data-url', testUrl);
  });

  it('should have hide-controls class when controls is false', () => {
    const { container } = render(<EasyPlayer controls={false} />);
    expect(container.firstChild).toHaveClass('hide-controls');
  });

  it('should not have hide-controls class when controls is true', () => {
    const { container } = render(<EasyPlayer controls={true} />);
    expect(container.firstChild).not.toHaveClass('hide-controls');
  });

  it('should have easy-player class by default', () => {
    const { container } = render(<EasyPlayer />);
    expect(container.firstChild).toHaveClass('easy-player');
  });

  it('should hide controls in live mode by default', () => {
    const { container } = render(<EasyPlayer mode="live" />);
    expect(container.firstChild).toHaveClass('hide-controls');
  });

  it('should show controls in vod mode by default', () => {
    const { container } = render(<EasyPlayer mode="vod" />);
    expect(container.firstChild).not.toHaveClass('hide-controls');
  });
});
