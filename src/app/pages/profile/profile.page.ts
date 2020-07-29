import { Component, OnInit } from '@angular/core';
import { DataAccessService } from 'src/app/services/data-access.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  user;

  constructor(
    private dataSvc: DataAccessService,
    private authSvc: AuthenticationService,
    private router: Router
  ) { 
    this.dataSvc.getUser(this.authSvc.getUserFromLocal().uid).subscribe(
      data => { 
        this.user = data;
        this.authSvc.setUserLocal(this.user);
      }
    );
  }

  ngOnInit() {
  }

  showUpdateProfilePage() {
    this.router.navigate(['update-profile']);
  }

  signOut() {
    this.authSvc.SignOut();
  }

}
