'use client';

import { DeleteOutlined } from '@ant-design/icons';
import { Button, Popconfirm } from 'antd';
import { useState } from 'react';
import { palette } from '@/lib/theme';

interface DeleteTaskButtonProps {
  onConfirm: () => Promise<void>;
}

// Revealed when the enclosing `group` has data-hovered="true", on keyboard focus,
// while its confirmation is open, and always on devices without hover.
export default function DeleteTaskButton({ onConfirm }: DeleteTaskButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState('');

  const confirmDelete = async () => {
    setError('');
    try {
      await onConfirm();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not delete task.');
    }
  };

  return (
    <div
      className="opacity-0 transition-opacity focus-within:opacity-100 group-data-[hovered=true]:opacity-100 [@media(hover:none)]:opacity-100"
      style={isOpen ? { opacity: 1 } : undefined}
    >
      <Popconfirm
        title="Delete this task?"
        description={error || 'This will permanently delete the task and its steps.'}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
        placement="bottomLeft"
        open={isOpen}
        onOpenChange={setIsOpen}
        onConfirm={confirmDelete}
      >
        <Button
          shape="circle"
          type="text"
          aria-label="Delete task"
          title="Delete task"
          icon={<DeleteOutlined />}
          style={{
            width: 40,
            height: 40,
            backgroundColor: palette.redOrange,
            color: '#FFFFFF',
          }}
        />
      </Popconfirm>
    </div>
  );
}
