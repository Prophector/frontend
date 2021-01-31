import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-accordion-item',
  templateUrl: './accordion-item.component.html',
  styleUrls: ['./accordion-item.component.scss'],
})
export class AccordionItemComponent implements OnInit {
  @Input()
  public open = false;

  constructor() {}

  ngOnInit(): void {}

  public toggle(): void {
    this.open = !this.open;
  }
}
