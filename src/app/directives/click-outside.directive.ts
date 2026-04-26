import { Directive, ElementRef, HostListener, output } from '@angular/core';

@Directive({
  selector: '[clickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {

  clickOutside = output<void>();

  constructor(private el: ElementRef) { }

  @HostListener('document:click', ['$event.target'])
  onClick(target: EventTarget | null): void {
    if (target && !this.el.nativeElement.contains(target)) {
      this.clickOutside.emit();
    }
  }
}
