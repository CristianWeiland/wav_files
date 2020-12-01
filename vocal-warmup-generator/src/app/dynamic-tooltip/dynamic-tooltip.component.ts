import { Component, Input, OnInit, TemplateRef } from '@angular/core';
/**
 * This component will be used to show custom tooltip
 * 
 * This component will be rendered using OverlayModule of angular material
 * This component will be rendered by the directive on an Overlay
 * 
 * CONSUMER will not be using this component directly
 * This component will be hosted in an overlay by ToolTipRenderer directive
 * This component exposes two properties. These two properties will be filled by ToolTipRenderer directive
 * 1. text - This is a simple string which is to be shown in the tooltip; This will be injected in the ToolTipRenderer directive
 *    by the consumer
 * 2. contentTemplate - This gives finer control on the content to be shown in the tooltip
 * 
 * NOTE - ONLY one should be specified; If BOTH are specified then "template" will be rendered and "text" will be ignored
 */
@Component({
  selector: 'app-dynamic-tooltip',
  templateUrl: './dynamic-tooltip.component.html',
  styleUrls: ['./dynamic-tooltip.component.css']
})
export class DynamicTooltipComponent implements OnInit {

  /**
   * This is simple text which is to be shown in the tooltip
   */
  @Input() text: string;

  /**
   * This provides finer control on the content to be visible on the tooltip
   * This template will be injected in ToolTipRenderer directive in the consumer template
   * <ng-template #template>
   *  content.....
   * </ng-template>
   */
  @Input() contentTemplate: TemplateRef<any>;

  constructor() { }

  ngOnInit() {
  }

} 