import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing/app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular material
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';

// Own components
import { HomeComponent } from './home/home.component';
import { ToolbarComponent } from './toolbar/toolbar.component';
import { WarmupListComponent } from './warmup-list/warmup-list.component';
import { WarmupEditorComponent } from './warmup-editor/warmup-editor.component';
import { MediaPlayerComponent } from './media-player/media-player.component';
import { DynamicTooltipComponent } from './dynamic-tooltip/dynamic-tooltip.component';

// Directives
import { ToolTipRendererDirective } from './app-directives/dynamic-tooltip-renderer.directive';
import { WarmupsListComponent } from './warmups-list/warmups-list.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    ToolbarComponent,
    WarmupListComponent,
    WarmupEditorComponent,
    MediaPlayerComponent,
    DynamicTooltipComponent,
    ToolTipRendererDirective,
    WarmupsListComponent,
  ],
  imports: [
    AppRoutingModule,
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    // Material components
    DragDropModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSelectModule,
    MatSliderModule,
    MatTableModule,
    MatTooltipModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
