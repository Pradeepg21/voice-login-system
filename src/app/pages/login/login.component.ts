import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../../api.service';
import { catchError, switchMap } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  mediaRecorder: MediaRecorder | undefined;
  audioChunks: Blob[] = [];
  audioBlobUrl: string | null = null;
  recordingInProgress = false;
  isRecrodingComplete = false;
  username: string = '';

  isSignDivVisiable: boolean  = true;

  signUpObj: SignUpModel  = new SignUpModel();
  loginObj: LoginModel  = new LoginModel();
  http: any;

  constructor(private router: Router, private apiService: ApiService){}
  startRecording() {
    this.audioChunks = [];
    this.recordingInProgress = true;
    this.isRecrodingComplete = false;
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = event => {
          this.audioChunks.push(event.data);
        };
        this.mediaRecorder.start();
      })
      .catch(error => {
        console.error('Error accessing microphone:', error);
      });
  }

  stopRecording() {
    this.recordingInProgress = false;
    this.isRecrodingComplete = true;
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
        this.audioBlobUrl = URL.createObjectURL(audioBlob);
      };
    }
  }

  playRecording() {
    if (this.audioBlobUrl) {
      const audio = new Audio(this.audioBlobUrl);
      audio.play();
    }
  }

  sendRecording() {
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
    const reader = new FileReader();
  
    reader.onload = () => {
      const base64data = reader.result?.toString().split(',')[1]; // Extracting base64 data
  
      if (base64data) {
        this.apiService.sendCredentials(this.loginObj.email, base64data)
          .pipe(
            switchMap(response => {
              console.log('Credentials sent successfully:', response);
              // Handle response if needed
              return response; // Returning the response for further processing
            }),
            catchError(error => {
              console.error('Error sending credentials:', error);
              // Handle error if needed
              throw error; // Rethrow the error to be caught by the component
            })
          )
          .subscribe();
      } else {
        console.error('Base64 data is null or undefined.');
      }
    };
  
    reader.onerror = (error) => {
      console.error('FileReader error:', error);
      // Handle error if needed
    };
  
    reader.readAsDataURL(audioBlob);
  }
  



  onRegister() {
    debugger;
    const localUser = localStorage.getItem('angular17users');
    if(localUser != null) {
      const users =  JSON.parse(localUser);
      users.push(this.signUpObj);
      localStorage.setItem('angular17users', JSON.stringify(users))
    } else {
      const users = [];
      users.push(this.signUpObj);
      localStorage.setItem('angular17users', JSON.stringify(users))
    }
    alert('Registration Success')
  }

  onLogin() {
    debugger;
    const localUsers =  localStorage.getItem('angular17users');
    if(localUsers != null) {
      const users =  JSON.parse(localUsers);

      const isUserPresent =  users.find( (user:SignUpModel)=> user.email == this.loginObj.email && user.password == this.loginObj.password);
      if(isUserPresent != undefined) {
        alert("User Found...");
        localStorage.setItem('loggedUser', JSON.stringify(isUserPresent));
        this.router.navigateByUrl('/dashboard');
      } else {
        alert("No User Found")
      }
    }
  }

}

export class SignUpModel  {
  name: string;
  email: string;
  password: string;

  constructor() {
    this.email = "";
    this.name = "";
    this.password= ""
  }
}

export class LoginModel  { 
  email: string;
  password: string;

  constructor() {
    this.email = ""; 
    this.password= ""
  }
}
