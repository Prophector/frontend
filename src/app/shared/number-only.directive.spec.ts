import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NumberOnlyDirective } from './number-only.directive';

describe('NumberOnlyDirective', () => {
  @Component({
    template: ` <form>
      <input type="text" name="value" appNumberOnly [(ngModel)]="value" />
    </form>`,
  })
  class TestNumberOnlyComponent {
    // tslint:disable-next-line:whitespace
    public value? = 50;
  }

  let component: TestNumberOnlyComponent;
  let fixture: ComponentFixture<TestNumberOnlyComponent>;
  let inputEl: DebugElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestNumberOnlyComponent, NumberOnlyDirective],
      imports: [FormsModule],
    });
    fixture = TestBed.createComponent(TestNumberOnlyComponent);
    component = fixture.componentInstance;
    inputEl = fixture.debugElement.query(By.css('input'));
  });

  it('handles initial values', () => {
    inputEl.triggerEventHandler('focus', null);
    fixture.detectChanges();
    expect(component.value).toBe(50);
  });

  it('handles model changes', fakeAsync(() => {
    component.value = 0;
    fixture.detectChanges();
    tick();
    expect(inputEl.nativeElement.value).toBe('0');
  }));

  it('converts inputs to number', fakeAsync(() => {
    fixture.detectChanges();
    tick();
    expect(component.value).toBe(50);

    inputEl.nativeElement.value = '100';
    inputEl.nativeElement.dispatchEvent(new Event('input'));
    expect(component.value).toBe(100);
  }));

  it('converts "0" to 0', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    inputEl.nativeElement.value = '0';
    inputEl.nativeElement.dispatchEvent(new Event('input'));
    expect(component.value).toBe(0);
  }));

  it('handles empty value', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    inputEl.nativeElement.value = '';
    inputEl.nativeElement.dispatchEvent(new Event('input'));
    expect(component.value).toBe(undefined);
  }));

  it('handles text', fakeAsync(() => {
    fixture.detectChanges();
    tick();

    inputEl.nativeElement.value = 'foo';
    inputEl.nativeElement.dispatchEvent(new Event('input'));
    expect(component.value).toBe(undefined);
  }));

  it('handles undefined model value', fakeAsync(() => {
    component.value = undefined;
    fixture.detectChanges();
    tick();
    expect(inputEl.nativeElement.value).toBe('');
  }));
});
