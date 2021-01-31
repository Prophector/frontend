import { Directive, ElementRef, forwardRef, HostListener, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

function convertToNumber(value: unknown): number | undefined {
  if (value || value === 0) {
    const numbered = Number(value);
    return isNaN(numbered) ? undefined : numbered;
  }

  return undefined;
}

/**
 * Use on a form control to always format the value as number.
 * Useful e.g. if you have `<input type="text" [(ngModel)]="foo">` and you want
 * the model to be of type `number`.
 * A `NaN` or an empty string will be formatted as `undefined`.
 */
@Directive({
  selector: '[appNumberOnly]',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      // tslint:disable-next-line:no-forward-ref
      useExisting: forwardRef(() => NumberOnlyDirective),
      multi: true,
    },
  ],
})
export class NumberOnlyDirective implements ControlValueAccessor {
  /**
   * Function to call when the value changes with the converted value.
   */
  private onChange?: (val: number | undefined) => void;

  constructor(private readonly renderer: Renderer2, private readonly element: ElementRef) {}

  @HostListener('input', ['$event.target.value'])
  public input(value: unknown): void {
    if (this.onChange) {
      this.onChange(convertToNumber(value));
    }
  }

  /**
   * Called when the form is initialized.
   * @param fn A function to call with the new value after the input changed.
   */
  public registerOnChange(fn: (val: number | undefined) => void): void {
    this.onChange = fn;
  }

  /**
   * Called when writing the value to the form control.
   */
  public writeValue(obj: unknown): void {
    const element = this.element.nativeElement;
    const numberValue = convertToNumber(obj);

    // convert to empty string, otherwise `undefined` appears in the input
    const inputValue = numberValue === undefined ? '' : numberValue;

    this.renderer.setProperty(element, 'value', inputValue);
  }

  public registerOnTouched(fn: unknown): void {
    // nop
  }

  public setDisabledState(isDisabled: boolean): void {
    // nop
  }
}
