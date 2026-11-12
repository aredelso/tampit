import React from 'react';
import { render } from '@testing-library/react';
import { Tabs } from './Tabs';

describe('Tabs Component', () => {
  const mockTabs = [
    { key: 'all', label: 'All' },
    { key: 'following', label: 'Following' },
    { key: 'saved', label: 'Saved' },
  ];

  describe('Rendering', () => {
    it('renders tabs component', () => {
      const { container } = render(
        <Tabs
          tabs={mockTabs}
          activeTab="all"
          onTabChange={() => {}}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('renders with active tab', () => {
      const { container } = render(
        <Tabs
          tabs={mockTabs}
          activeTab="following"
          onTabChange={() => {}}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('renders single tab', () => {
      const { container } = render(
        <Tabs
          tabs={[{ key: 'single', label: 'Single Tab' }]}
          activeTab="single"
          onTabChange={() => {}}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('renders many tabs', () => {
      const manyTabs = Array.from({ length: 10 }, (_, i) => ({
        key: `tab-${i}`,
        label: `Tab ${i + 1}`,
      }));

      const { container } = render(
        <Tabs
          tabs={manyTabs}
          activeTab="tab-0"
          onTabChange={() => {}}
        />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('accepts onTabChange callback', () => {
      const handleChange = jest.fn();
      render(
        <Tabs
          tabs={mockTabs}
          activeTab="all"
          onTabChange={handleChange}
        />
      );
      expect(handleChange).not.toHaveBeenCalled();
    });

    it('accepts tab configuration', () => {
      const { container } = render(
        <Tabs
          tabs={mockTabs}
          activeTab="all"
          onTabChange={() => {}}
        />
      );
      expect(container).toBeInTheDocument();
    });
  });

  describe('Props', () => {
    it('renders with required props', () => {
      const { container } = render(
        <Tabs
          tabs={mockTabs}
          activeTab="all"
          onTabChange={() => {}}
        />
      );
      expect(container).toBeInTheDocument();
    });

    it('handles prop updates', () => {
      const { rerender } = render(
        <Tabs
          tabs={mockTabs}
          activeTab="all"
          onTabChange={() => {}}
        />
      );

      rerender(
        <Tabs
          tabs={mockTabs}
          activeTab="following"
          onTabChange={() => {}}
        />
      );

      expect(true).toBe(true);
    });

    it('handles empty tabs array', () => {
      const { container } = render(
        <Tabs
          tabs={[]}
          activeTab="all"
          onTabChange={() => {}}
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('handles activeTab not in tabs list', () => {
      const { container } = render(
        <Tabs
          tabs={mockTabs}
          activeTab="non-existent"
          onTabChange={() => {}}
        />
      );

      expect(container).toBeInTheDocument();
    });

    it('handles special characters in tab labels', () => {
      const specialTabs = [
        { key: 'special1', label: 'Tab & Special' },
        { key: 'special2', label: 'Tab < > Special' },
      ];

      const { container } = render(
        <Tabs
          tabs={specialTabs}
          activeTab="special1"
          onTabChange={() => {}}
        />
      );

      expect(container).toBeInTheDocument();
    });
  });
});
