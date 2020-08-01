import { Component, OnInit } from '@angular/core';
import { DataAccessService } from 'src/app/services/data-access.service';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { ActionSheetController, LoadingController } from '@ionic/angular';
import { CameraOptions, Camera } from '@ionic-native/camera/ngx';
import { AngularFireUploadTask, AngularFireStorage } from '@angular/fire/storage';
import { tap, finalize } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { UtilService } from 'src/app/services/util.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-update-profile',
  templateUrl: './update-profile.page.html',
  styleUrls: ['./update-profile.page.scss'],
})

export class UpdateProfilePage implements OnInit {

  user;
  task: AngularFireUploadTask;
  uploadedFileURL: Observable<string>;
  data = {
    image: '../../../assets/icon/avatar.svg',
    firstName: '',
    lastName: '',
    phone: ''
  }
  fileSize: number;
  form: FormGroup;

  constructor(
    private dataSvc: DataAccessService,
    private authSvc: AuthenticationService,
    public actionSheetController: ActionSheetController,
    public camera: Camera,
    private storage: AngularFireStorage,
    private util: UtilService,
    private loadingCntrl: LoadingController,
    private formBuilder: FormBuilder
  ) { 
      this.dataSvc.getUser(this.authSvc.getUserFromLocal().uid).subscribe(
        data => { 
          this.user = data;
          this.data.firstName = this.user.firstName;
          this.data.lastName = this.user.lastName;
          this.data.phone = this.user.phone;
          this.data.image = this.user.image ;
        }
      );

      this.form = this.formBuilder.group({
        
        firstName: new FormControl('', Validators.compose([
          //...
        ])),
        lastName: new FormControl('', Validators.compose([
          //...
        ])),
        phone: new FormControl('', Validators.compose([
          //...
        ]))

      });

  }

  ngOnInit() {
  }


  
  // ActionSheet Handler
  async openActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      buttons: [{
        text: 'Take a picture',
        role: 'destructive',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.CAMERA);
        }
      }, {
        text: 'Choose a Picture',
        handler: () => {
          this.takePicture(this.camera.PictureSourceType.PHOTOLIBRARY);
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

  async takePicture(source) {
    const options: CameraOptions = {
      quality: 25,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: source,
      correctOrientation: true
    }
    
    this.camera.getPicture(options).then((base64Image) => {
      this.uploadFile(base64Image);
    }, (err) => {
      console.log(err)
    });
  }

  async uploadFile(base64Image) {
    const loading = await this.loadingCntrl.create({
      message: 'Please wait...'
    }).then(loading => {

      loading.present();

      const file = this.getBlob(base64Image,"image/jpeg" );
      const path = `images/users/${new Date().getTime()}_${this.user.uid}.jpg`;
      const fileRef = this.storage.ref(path);
      this.task = this.storage.upload(path, file);
      this.task.snapshotChanges().pipe(
        
        finalize(() => {
          this.uploadedFileURL = fileRef.getDownloadURL();
          
          this.uploadedFileURL.subscribe(resp=>{
            this.data.image = resp; 
            loading.dismiss();

            this.util.toast('Picture has been successfully uploaded.', 'success', 'bottom');
          }, err => {
            console.error(err);
          })
        }),
        tap(snap => {
            this.fileSize = snap.totalBytes;
        })
      ).subscribe();
      
    });
  }

  private getBlob(b64Data:string, contentType:string, sliceSize:number= 512) {
    contentType = contentType || '';
    sliceSize = sliceSize || 512;
    let byteCharacters = atob(b64Data);
    let byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        
        let slice = byteCharacters.slice(offset, offset + sliceSize);

        let byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        let byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);

    }
    return new Blob(byteArrays, {type: contentType});
  }

  update() {
    
    let data = {
      firstName: this.form.value.firstName,
      lastName: this.form.value.lastName,
      phone: this.form.value.phone,
      image: this.data.image
    }
    this.dataSvc.updateUserDetails(this.user.uid, data).then(()=>{
      this.util.toast('successfully updated information', 'success', 'bottom');
    }).catch(err => {
      this.util.errorToast('Error in updating information. Please try again!');
    });
    
  }

}
