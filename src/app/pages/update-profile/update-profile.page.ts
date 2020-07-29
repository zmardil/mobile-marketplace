import { Component, OnInit } from '@angular/core';
import { DataAccessService } from 'src/app/services/data-access.service';
import { AuthenticationService } from 'src/app/services/authentication.service';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.page.html',
  styleUrls: ['./update-profile.page.scss'],
})

export class UpdateProfilePage implements OnInit {

  user;

  constructor(
    private dataSvc: DataAccessService,
    private authSvc: AuthenticationService
  ) { 
    this.dataSvc.getUser(this.authSvc.getUserFromLocal().uid).subscribe(
      data => { 
        this.user = data;
      }
    );
  }

  ngOnInit() {
  }

}
