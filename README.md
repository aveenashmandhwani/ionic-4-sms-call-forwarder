


Plugins installed:

ionic cordova plugin add cordova-plugin-sms-receive

ionic cordova plugin add cordova-sms-plugin
npm install @ionic-native/sms


These under pulgins are unused..
ionic cordova plugin add cordova-plugin-android-permissions
npm install @ionic-native/android-permissions


Add this tag 
 <uses-permission android:name="android.permission.SEND_SMS" /> 

in manifest tag in
in platforms\android\app\src\main\AndroidManifest.xml file. 