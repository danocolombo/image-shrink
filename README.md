# ImageShrink
***
This is a simple Node Electron project that provides a desktop app to shrink image files. It saves the files locally and even provides a log file of the activity. 

---
Grab the repo...
npm install

There is an environment flag at the top of main.js, this will allow you to do development work or prepare for production. By default in the repo, it is set to production.

To run simply... npm start

If you want to package a final app, you can look in package.json file and see the build scripts. Example for Mac is 'npm run package-mac'. This creates a build and puts it in the release-builds folder.

NOTE: If you change the package folder in the package.json folder, make sure you have the folder defined in your .gitignore file.
