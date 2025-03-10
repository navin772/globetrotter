import { useEffect } from 'react';

export const useKeyboardNavigation = ({
  escapeHandler,
  enterHandler,
  arrowHandlers,
  tabHandler,
  spaceHandler,
  enabled = true
}) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'Escape':
          if (escapeHandler) {
            event.preventDefault();
            escapeHandler(event);
          }
          break;

        case 'Enter':
          if (enterHandler) {
            event.preventDefault();
            enterHandler(event);
          }
          break;

        case ' ':
          if (spaceHandler) {
            event.preventDefault();
            spaceHandler(event);
          }
          break;

        case 'Tab':
          if (tabHandler) {
            tabHandler(event);
          }
          break;

        case 'ArrowUp':
          if (arrowHandlers?.up) {
            event.preventDefault();
            arrowHandlers.up(event);
          }
          break;

        case 'ArrowDown':
          if (arrowHandlers?.down) {
            event.preventDefault();
            arrowHandlers.down(event);
          }
          break;

        case 'ArrowLeft':
          if (arrowHandlers?.left) {
            event.preventDefault();
            arrowHandlers.left(event);
          }
          break;

        case 'ArrowRight':
          if (arrowHandlers?.right) {
            event.preventDefault();
            arrowHandlers.right(event);
          }
          break;

        default:
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, escapeHandler, enterHandler, arrowHandlers, tabHandler, spaceHandler]);
};

// Example usage:
/*
const MyComponent = () => {
  useKeyboardNavigation({
    escapeHandler: () => handleClose(),
    enterHandler: () => handleSubmit(),
    arrowHandlers: {
      up: () => navigateOptions('up'),
      down: () => navigateOptions('down'),
    },
    spaceHandler: () => toggleSelection(),
    enabled: isInteractive,
  });

  return <div>...</div>;
};
*/
