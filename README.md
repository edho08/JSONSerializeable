# JSONSerializeable
This an example on how (not) to save Object to JContainers and revive it for later use.


## Setting Up
This tutorial is written in Skyrim Platform plugin-example

1. Run `npm i` on the command line to install the dependencies.
2. Create a file `tsc/config.js` with the following contents:
   ```js
   module.exports = {
       // Change `seRoot` to the correct path to the Skyrim SE folder. The path should have slashes like this: `/` (not `\\`).
       seRoot: "C:/Program Files (x86)/Steam/steamapps/common/Skyrim Special Edition"
   };
   ```

3. Run `npm run dev`. If everything is ok, the message `Found 0 errors` will appear.
4. Log in to Steam and start the game with `skse64_loader.exe`.

# Requirement
1. A working and not crashing skyrim.
2. Skyrim Platform.
3. JContainers.