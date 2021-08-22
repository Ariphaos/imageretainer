Compendium Image Retainer
=========================

This module provides a mechanism for you to restore your actor images, token settings, and item images after a game system update, which will normally bulldoze any attempts to curate nice-looking tokens, for example with the aid of [Compendium Image Mapper](https://foundryvtt.com/packages/imagemapper). 

### Instructions

Click the 'backup' button in the Compendium tab after you make significant image changes to your system compendiums. Click the 'restore' button to apply them if e.g. you reinstalled your system, or otherwise wish to do it manually. 

The module will notify you to restore on version change, though only if you have actual backup files to use for the curent system.

Keep in mind that all modifications to a system's compendia modify the system data itself. If you have multiple worlds, you only actually need this module on one of them.

### Configuration

Only two settings currently.

* **System Compendiums Only** By default, only analyze system compendia. Turn this off if you are making significant changes to a module's compendium and wish to save it.


* **Ignore Foundry SVGs** By default these are ignored along with system images. If you are developing a system, you may want to turn this off to fish for any default Foundry art you want to override.

### Tikael's Macro Users

This being my first module, I made use of some code from [TikaelSol's macro](https://gitlab.com/-/snippets/2138719). The file format is the same, but the path has changed - you will want to move your backup files for a given system to the imageretainer/{system}/ directory. After which you can restore normally.

Unlike Tikael's Macro, this module also saves item images, and filters out a system's internal images.