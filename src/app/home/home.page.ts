import { Component } from '@angular/core';
import { SMS } from '@ionic-native/sms/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';

import { AlertController } from '@ionic/angular';

import { Vibration } from '@ionic-native/vibration/ngx';

declare var SMSReceive: any;
declare var window: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {
  public forwardingNumbers = ''; // Write your forwarding numbers here, to which you want to forward your sms.
  public vibratingNumbers = ''; // Vibrates on incoming sms by these numbers.
  public startingMessage = '';
  public appendingMessage = '';
  public signature = 'Message sent by forwarder app!';
  public enableSMSForwardingService = false;
  public enableVibratingService = false;
  public enableCallListener = false;
  public isIncludeAdrress = true;

  public DEFAULT_CALL_NOTIFICATION = '[CALL] Incoming call by ';
  public DEFAULT_CALLER_MESSSAGE =
    '[Call Forward] This caller is unreachable on this number. Please call him/her on either of this number:\n' +
    this.forwardingNumbers;
  public TEST_SMS = 'This is test message!!! ';

  constructor(
    private sms: SMS,
    public alertController: AlertController,
    public androidPermissions: AndroidPermissions,
    private vibration: Vibration
  ) {}

  async checkAndOrRequestPermission(permission: string): Promise<boolean> {
    let permit = false;
    // First we check whether we have already have permission or not.
    // await is used since its I/O process so will run asyncronously.
    await this.androidPermissions
      .checkPermission(permission)
      .then(status => {
        permit = status.hasPermission;
      })
      .catch(err => {
        alert('Error in checking permissions. Please try again! ' + err);
      });
    // If we already have permission then no need for requesting. We will return from here.
    if (permit) {
      return permit;
    }

    // Else we will request required permission.
    await this.androidPermissions
      .requestPermission(permission)
      .then(status => {
        permit = status.hasPermission;

        if (status.hasPermission) {
          // Accepted or previously had accepted permission ..
          alert('Permission Accepted!! Thank you.');
        } else {
          // Rejected
          alert(
            'Permission Rejected!! Please accept required permissions in order to use features. Thank you.' +
              permission
          );
        }
      })
      .catch(err => {
        alert('Request Permission has got error. Please try again. ' + err);
      });
    return permit;
  }

  async CallService() {
    try {
      if (this.enableCallListener) {
        let permit: boolean;
        permit = await this.checkAndOrRequestPermission(
          this.androidPermissions.PERMISSION.READ_CALL_LOG
        );
        permit =
          permit &&
          (await this.checkAndOrRequestPermission(
            this.androidPermissions.PERMISSION.READ_PHONE_STATE
          ));
        permit =
          permit &&
          (await this.checkAndOrRequestPermission(this.androidPermissions.PERMISSION.VIBRATE));

        if (!permit) {
          this.enableCallListener = false;
          return;
        }

        window.PhoneCallTrap.onCall(obj => {
          const arr = obj.split('&');
          const state = arr[0];
          const phoneNumber = arr[1];
          if (state === 'RINGING' && phoneNumber !== 'null') {
            this.DEFAULT_CALL_NOTIFICATION += phoneNumber;
            if (this.isPhone(phoneNumber)) {
              // All other calls of 345 or 333 are ignored..
              this.sendSMS(this.forwardingNumbers, this.DEFAULT_CALL_NOTIFICATION);
              this.sendSMS(phoneNumber, this.DEFAULT_CALLER_MESSSAGE);
            }
          }
        });
      }
    } catch (e) {
      alert(e);
    }
  }

  SMSForwardingService() {
    if (this.enableSMSForwardingService && !this.enableVibratingService) {
      this.startSMSReceivingService();
    } else if (!this.enableVibratingService) {
      this.stopSMSReceivingService();
    }
  }
  VibrationService() {
    if (this.enableVibratingService && !this.enableSMSForwardingService) {
      this.startSMSReceivingService();
    } else if (!this.enableSMSForwardingService) {
      this.stopSMSReceivingService();
    }
  }

  startSMSReceivingService() {
    SMSReceive.startWatch(
      () => {
        alert('SMS Receiving Service has started successfully');

        document.addEventListener('onSMSArrive', (e: any) => {
          // this.presentAlert('A new sms has arrived', 'event');
          const IncomingSMS = e.data;
          // this.presentAlert('sms.address:' + IncomingSMS.address, 'sms');
          // this.presentAlert('sms.body:' + IncomingSMS.body, 'sms');
          // this.presentAlert(JSON.stringify(IncomingSMS), 'sms in json');
          this.processSMS(IncomingSMS);
        });
      },
      () => {
        alert('SMS Receiving Service start failed. Please try again!');
        this.enableSMSForwardingService = false;
        this.enableVibratingService = false;
      }
    );
  }

  processSMS(data) {
    let message = data.body;
    const address = data.address;
    // this.presentAlert('Message has received', 'Receiver Service');

    if (message && address) {
      if (!this.isPhone(address)) {
        return;
      }
      if (this.enableVibratingService && this.vibratingNumbers.includes(address)) {
        try {
          this.vibration.vibrate([10000, 1000, 10000]);
        } catch (e) {
          alert('Error in vibration! ' + e);
        }
      }

      message = '[SMS] By: ' + address + ':\n\n' + message;
      if (this.enableSMSForwardingService) {
        this.sendSMS(this.forwardingNumbers, message);
      }
    }

    // if (message && message.toLowerCase().includes('avee')) {
    //   this.presentAlert('Message has matched', 'Receiver Service');
    // }
  }

  stopSMSReceivingService() {
    SMSReceive.stopWatch(
      () => {
        alert('SMS Service has stopped successfully! ');
      },
      () => {
        alert('SMS Service stop failed.. ');
        this.enableSMSForwardingService = false;
        this.enableVibratingService = false;
      }
    );
  }

  stopVibration() {
    this.vibration.vibrate(0);
  }
  testSMS() {
    this.sendSMS(this.forwardingNumbers, this.TEST_SMS);
  }
  isPhone(phone: string) {
    // In start + is acceptable and all other chars should be digits. + for +92 numbers.
    // Also, length should be atleast 11.
    return /^\+{0,1}\d+$/.test(phone) && phone.length >= 11;
  }

  isPTCLNumber(phone: string) {
    if (phone) {
      return phone.startsWith('+9221') || phone.startsWith('+921') || phone.startsWith('021');
    }
  }
  sendSMS(phone: string, message: string) {
    // await this.presentAlert('Sms service', 'Send Service');
    if (!phone || !message) {
      alert('Phone or message is empty!' + phone);
      return;
    }

    phone = phone.replace(/\s+/g, ''); // remove all spaces.

    if (!this.isPhone(phone)) {
      alert('Phone number should be atleast of 11 digits with + in starting optional! ' + phone);
      return;
    }

    if (this.isPTCLNumber(phone)) {
      alert('PTCL number detected ' + phone);
      return;
    }

    message = this.startingMessage + message + this.appendingMessage;
    if (this.signature !== '') {
      message += `\n\n${this.signature}`;
    }

    const options = {
      replaceLineBreaks: false,
      android: {
        intent: ''
      }
    };

    const phoneArray = phone.split(',');
    phoneArray.forEach(num => {
      this.sms
        .send(num, message, options)
        .then(() => {})
        .catch(err => {
          this.presentAlert(JSON.stringify(err), 'Send Sms');
        });
    });
  }

  async presentAlert(text: string, subtitle: string) {
    const alert = await this.alertController.create({
      header: 'Alert',
      subHeader: subtitle,
      message: text,
      buttons: ['OK']
    });

    await alert.present();
  }
}
