import { TooltipDirective } from './tooltip.directive';
import { ElementRef } from '@angular/core';

describe('TooltipDirective', () => {
  it('should create an instance', () => {
    const directive = new TooltipDirective(
      new ElementRef<any>({
        classList: {
          add: () => {},
        },
      }),
    );
    expect(directive).toBeTruthy();
  });
});
