import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { DataAccessService } from 'src/app/services/data-access.service';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/storage';
import { Observable } from 'rxjs';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { UtilService } from 'src/app/services/util.service';
import { finalize, tap } from 'rxjs/operators';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import * as firebase from 'firebase/app'; 

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {

  userDetailsForm: FormGroup;
  userDetails;
  photo: SafeResourceUrl = "../../assets/image/user.png";
  profilePhoto: string;
  downloadUrl: string;
  uploading: boolean = false;
  task: AngularFireUploadTask;
  snapshot: Observable<any>;
  UploadedFileURL: Observable<string>;
  fileName:string;
  fileSize:number;
  isUploading:boolean;
  isUploaded:boolean;
  
  edit = false;


  constructor(
    private authSvc: AuthenticationService,
    private dataSvc: DataAccessService,
    private util: UtilService,
    private formBuilder: FormBuilder,
    public actionCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    private storage: AngularFireStorage,
    public camera: Camera,
    private sanitizer: DomSanitizer,
  ) { 

    this.authSvc.getUser().subscribe(user => {
      if(user) {
        this.dataSvc.getUserDetails(user.uid).subscribe(data => {
          this.userDetails = data;
          console.log(this.userDetails);
        });
      }
    })

    this.userDetailsForm = this.formBuilder.group({
      firstName: new FormControl('', Validators.compose([
        Validators.required
      ])),
      lastName: new FormControl('', Validators.compose([
        Validators.required
      ])),
      phone: new FormControl('', Validators.compose([
        Validators.required
      ]))
    })

  }

  ngOnInit() {
  }

  async openActionsheet() {
    const action = await this.actionCtrl.create({
      buttons: [{
        text: 'Take a picture',
        role: 'destructive',
        cssClass: 'buttonCss',
        handler: () => {
          this.takeProfilePic(this.camera.PictureSourceType.CAMERA);
          console.log('Take a picture clicked');
        }
      }, {
        text: 'Choose a picture',
        handler: () => {
          this.takeProfilePic(this.camera.PictureSourceType.PHOTOLIBRARY);
          console.log('Share clicked');
        }
      }, {
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'buttonCss_Cancel',

        handler: () => {
          console.log('Cancel clicked');
        }
      }]
    });
    await action.present();
  }

  async takeProfilePic(sourceType) {
    const options: CameraOptions = {
      quality: 25,
      destinationType: this.camera.DestinationType.DATA_URL,
      encodingType: this.camera.EncodingType.JPEG,
      mediaType: this.camera.MediaType.PICTURE,
      sourceType: sourceType,
      correctOrientation: true
    }



    this.camera.getPicture(options).then((imageData) => {
      // imageData is either a base64 encoded string or a file URI
      // If it's base64 (DATA_URL):
      let base64Image = imageData;
      this.profilePhoto = base64Image;
      this.uploadFile(base64Image);
      //console.log(this.photo)
    }, (err) => {
      // Handle error
      console.log(err)
    });


  }
 

  uploadFile(base64Image) {
    const file = this.getBlob(base64Image,"image/jpeg" );
    console.log('FILE', file)

    this.isUploading = true;
    this.isUploaded = false;


    this.fileName = 'ListItem';
   
    // The storage path
    const path = `images/${new Date().getTime()}_${this.fileName}.jpg`;

    //File reference
    const fileRef = this.storage.ref(path);

    // The main task
    this.task = this.storage.upload(path, file);
    console.log('After Upload')

   this.task.snapshotChanges().pipe(
      
      finalize(() => {
        console.log('upload')
        this.UploadedFileURL = fileRef.getDownloadURL();
        this.UploadedFileURL.subscribe(resp=>{
        console.log(resp);
        this.downloadUrl = resp; 
        this.isUploading = false;
        this.isUploaded = true;
        this.uploading = false;
        this.util.toast('Picture has been successfully uploaded.', 'success', 'bottom');
        },error=>{
          console.error(error);
        })
      }),
      tap(snap => {
          this.fileSize = snap.totalBytes;
          console.log(snap)
      })
    ).subscribe();
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
    return   new Blob(byteArrays, {type: contentType});
  }


  onClickSave(){
    console.log(this.downloadUrl)
    console.log(this.userDetails.dpURL);
    this.downloadUrl = this.downloadUrl ? this.downloadUrl : this.userDetails.dpURL;
      let listing = {
        firstName:this.userDetailsForm.value.firstName,
        lastName:this.userDetailsForm.value.lastName,
        phone:this.userDetailsForm.value.phone, 
        ...(this.downloadUrl && { dpURL: this.downloadUrl})
      }
      console.log(this.userDetails.uid, listing)
      this.dataSvc.addUserDetails(this.userDetails.uid, listing).then(()=>{
        this.util.toast('Listing has been successfully added!', 'success', 'bottom');
        this.edit = !this.edit;
      })
      .catch(err => {
        console.log(err);
        this.util.errorToast('Error in adding listing. Please try again!');
      })
  }

}
