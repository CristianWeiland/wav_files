import { Component, OnInit } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-warmup-list',
  templateUrl: './warmup-list.component.html',
  styleUrls: ['./warmup-list.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class WarmupListComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {}

  displayedColumns: string[] = ['id', 'name', 'actions'];
  expandedElement: null;
  audio: HTMLAudioElement;

  deleteThisVarLater = true;

  warmupList = [
    { id: 1, name: 'Basic warmup' },
    { id: 2, name: 'Quick warmup' },
    { id: 3, name: 'Advanced warmup' },
    { id: 4, name: 'Range extension warmup' },
  ];

  selectElement(element) {
    this.expandedElement = this.expandedElement === element ? null : element;

    if (this.expandedElement) {
      if (this.deleteThisVarLater)
        this.audio = new Audio('../../../assets/audio/new.wav');
      else
        this.audio = new Audio('../../../assets/audio/new1.wav');
      this.deleteThisVarLater = !this.deleteThisVarLater;
    }
  }
}
