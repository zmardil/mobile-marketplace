import { Component, OnInit } from '@angular/core';
import { DataAccessService } from 'src/app/services/data-access.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ActionSheetController } from '@ionic/angular';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.page.html',
  styleUrls: ['./update-profile.page.scss'],
})

export class UpdateProfilePage implements OnInit {

  user;

  constructor(
    private dataSvc: DataAccessService,
    private authSvc: AuthenticationService,
    public actionSheetController: ActionSheetController
  ) { 
    this.dataSvc.getUser(this.authSvc.getUserFromLocal().uid).subscribe(
      data => { 
        this.user = data;
      }
    );
  }

  ngOnInit() {
  }

  async openActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      buttons: [{
        text: 'Take a picture',
        role: 'destructive',
        handler: () => {
          // ...
        }
      }, {
        text: 'Choose a Picture',
        handler: () => {
          // ...
        }
      }, {
        text: 'Cancel',
        role: 'cancel',
        handler: () => {
          // ...
        }
      }]
    });
    await actionSheet.present();
  }

}
