import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { createPopper } from '@popperjs/core';

@Directive({
  selector: '[appTooltip]',
})
export class TooltipDirective {
  @Input()
  public appTooltip!: string;

  private tooltip?: HTMLDivElement;

  constructor(private readonly elementRef: ElementRef) {
    this.elementRef.nativeElement.classList.add('tooltip-available');
  }

  @HostListener('focusin')
  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.show();
  }

  @HostListener('focusout')
  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.destroyTooltip();
  }

  private show(): void {
    if (this.tooltip) {
      this.destroyTooltip();
    }
    this.tooltip = document.createElement('div');
    this.tooltip.classList.add('tooltip');
    this.tooltip.innerText = this.appTooltip;

    const tooltipArrow = document.createElement('div');
    tooltipArrow.classList.add('tooltip-arrow');
    tooltipArrow.setAttribute('data-popper-arrow', '');
    this.tooltip.appendChild(tooltipArrow);

    document.body.appendChild(this.tooltip);
    createPopper(this.elementRef.nativeElement, this.tooltip);
  }

  private destroyTooltip(): void {
    if (this.tooltip) {
      document.body.removeChild(this.tooltip);
      this.tooltip = undefined;
    }
  }
}
