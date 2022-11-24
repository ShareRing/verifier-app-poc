import { ReactNode } from 'react';
import { Button, OverlayTrigger, Tooltip, ButtonProps as BsButtonProps } from 'react-bootstrap';
import type { Placement } from 'react-bootstrap/types';

interface ButtonProps extends BsButtonProps {
  tooltip: ReactNode;
  placement?: Placement;
}

function ButtonTooltip({ tooltip, placement, children, ...props }: ButtonProps) {
  return (
    <OverlayTrigger placement={placement} overlay={<Tooltip>{tooltip}</Tooltip>}>
      <Button {...props}>{children}</Button>
    </OverlayTrigger>
  );
}

export default ButtonTooltip;
