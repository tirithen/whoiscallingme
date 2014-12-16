# Who's calling me?

This is a Firefox OS application that lets you see who is calling, even if the number is not in the contacts on your phone.

The application is free as in freedom and open source, something that is especially important when handling information about your connections to other people.

## Why?

I would like to have the chance to see who is contacting me before answering and I could not find any such applications that runs on Firefox OS.

## Who can use the application?

Anyone that has a phone that is running Firefox OS. If you have an Android device and want to try install the application and report about if the application works on Android that would be great.

## Installation

As there is currently no way of installing the application through Firefox Marketplace you will have to do this through the Firefox WebIDE:

1. Make sure that you have Firefox 34+ installed on a computer
2. Make sure that you have Node.js https://nodejs.org/ installed (for running npm)
3. Setup the connection between the phone and the computer https://developer.mozilla.org/en-US/docs/Tools/WebIDE#Setting_up_runtimes
4. Download the application https://github.com/tirithen/whoiscallingme/archive/master.zip (or clone the repository)
5. Extract the zip file
6. Install dependencies by running "npm install" in the extracted directory
7. Open the Firefox WebIDE (press Shift + F8 in Firefox)
8. Open the application code, from the menu select "Project" -> "Open Packaged App..." and select to the extracted directory
9. Click "Select Runtime" and select your device under "USB DEVICES"
10. Click on the play icon

## Why is the application not in the Firefox Marketplace?

Since the application needs permission to detect incoming calls and those applications are not allowed to be installed through the Firefox Marketplace. Feel free to contact me if you know more about this subject and can help make this application more easily accessible.

## Contributions

I see this kind of functionality as essential for any smartphone and I would like this to become a collaborative effort and so any collaborations and contributions are greatly appreciated.

### Reporting bugs/issues and making feature requests

If you find something that is broken or if you are missing a feature, feel free to report this on the GitHub page at https://github.com/tirithen/whoiscallingme/issues.

If you have the skills and want to create new feature or fix a bug, please create a pull request to the repository.

### Translations

The translation files are stored in the data/ directory and in the manifest.webapp file. If you know a language that is not translated or missing some translations, feel free to make the translations and create a pull request.

### External services

To make this application better at searching for information about phone numbers we need to add connections to as many services as possible. If you would like to add a service, make a copy of the file js/numberlookup/HittaSeNumberLookupSource.js and adapt it to the new service. Make sure to add a script tag for your new file and add the new constructor to the NumberLookupService instance that is created in js/app.js. If you would like to make a pull request so that others can use this service as well that would be great.
