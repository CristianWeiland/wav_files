import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { HomeComponent } from '../home/home.component';
import { InstructionsComponent } from '../instructions/instructions.component';
import { WarmupListComponent } from '../warmup-list/warmup-list.component';
import { WarmupEditorComponent } from '../warmup-editor/warmup-editor.component';

const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'warmups', component: WarmupListComponent },
    { path: 'warmup-editor/:warmupId', component: WarmupEditorComponent },
    { path: 'instructions', component: InstructionsComponent },
];

@NgModule({
    imports: [
        RouterModule.forRoot(routes)
    ],
    exports: [
        RouterModule
    ],
    declarations: []
})
export class AppRoutingModule { }