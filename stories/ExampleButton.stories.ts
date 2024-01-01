import type { Meta, StoryObj } from '@storybook/react';

import { Button as ExampleButton } from './Button';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Example/Story Button',
  component: ExampleButton,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} satisfies Meta<typeof ExampleButton>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const ExampleButtonPrimary: Story = {
  args: {
    primary: true,
    label: 'Button',
  },
};

export const ExampleButtonSecondary: Story = {
  args: {
    label: 'Button',
  },
};

export const ExampleButtonLarge: Story = {
  args: {
    size: 'large',
    label: 'Button',
  },
};

export const ExampleButtonSmall: Story = {
  args: {
    size: 'small',
    label: 'Button',
  },
};

export const ExampleButtonWarning: Story = {
  args: {
    primary: true,
    label: 'Delete now',
    backgroundColor: 'red',
  }
};