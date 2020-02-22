## Ionic Sms Call Forwarder

### 1. Setup:

First, Install Ionic and Cordova, globally, for running your app.

```bash
$ npm install -g ionic@latest;
$ npm install -g cordova;
```

Head to project's root directory and run these to download and install required dependencies and/or plugins.

```bash
#To install node_modules
$ npm install;

# or you can simply do
$ ionic serve;
# this will install all dependencies and will run you app in browser.
```

### NOTE:

`In case you get errors while installing node_modules, you can try following debugging steps:`

1. If you get any permission issues, try closing your editor like VSCode and open terminal with Administrator or root rights and then install node_modules.
2. Try removing package.lock.json and node_modules folder.
3. Try clearing npm cache by npm cache clean --force

### Build:

```bash
#For building and running your app in production and/or release mode.
$ ionic cordova run android --prod --release;

#For building your app in production and/or release mode.
$ ionic cordova build android --prod --release;
```

### Issues:

```bash
#App Scripts Issue:
npm install @ionic/app-scripts@latest --save-dev;
```

### NOTES:

`In case of updating any plugin(s), you have to remove android and/or ios folder from platforms as well as plugins from plugin folder.`

### \***\*\*\*\*\*\*\***END\***\*\*\*\*\*\*\***

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
