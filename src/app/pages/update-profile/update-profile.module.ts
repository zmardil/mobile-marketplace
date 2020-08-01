import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { UpdateProfilePageRoutingModule } from './update-profile-routing.module';

import { UpdateProfilePage } from './update-profile.page';
import { Camera } from '@ionic-native/camera/ngx';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    UpdateProfilePageRoutingModule,
    ReactiveFormsModule
  ],
  declarations: [UpdateProfilePage],
  providers: [Camera]
})
export class UpdateProfilePageModule {}
