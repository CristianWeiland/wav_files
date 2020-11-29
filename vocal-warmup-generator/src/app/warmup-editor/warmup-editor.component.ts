import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-warmup-editor',
  templateUrl: './warmup-editor.component.html',
  styleUrls: ['./warmup-editor.component.css']
})
export class WarmupEditorComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
  ) {}

  warmupId = -1;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.warmupId = parseInt(params.get('warmupId'));
    });
  }

}
