import {restorePaths, backupPaths} from "./backup.js";

Hooks.on('renderCompendiumDirectory', function (app, html) {
  if (!game.user.isGM)
    return;

  html.find(".directory-footer")
    .prepend(`<div class="action-buttons flexrow"><button id="btn-imageretainer"><i class="fas fa-upload"> </i> `
      + game.i18n.localize('imageretainer.restore.name') +`</div>`)
    .promise()
    .done(() => {
      $('#btn-imageretainer').on('click', () => {
        let d = new Dialog({
          title: game.i18n.localize('imageretainer.restore.title'),
          content: "<p>" + game.i18n.localize('imageretainer.restore.description') +"</p>",
          buttons: {
            run: {
              icon: '<i class="fas fa-check"></i>',
              label: game.i18n.localize('imageretainer.restore.run'),
              callback: restorePaths
            },
            cancel: {
              icon: '<i class="fas fa-times"></i>',
              label: game.i18n.localize('imageretainer.cancel'),
              callback: () => {}
            }
          },
          default: "run",
          render: () => {},
          close: () => {}
        });
        d.render(true);
      })
    });

  html.find(".directory-footer")
    .prepend(`<div class="action-buttons flexrow"><button id="btn-imageretainer"><i class="fas fa-save"> </i> `
      + game.i18n.localize('imageretainer.backup.name') +`</div>`)
    .promise()
    .done(() => {
      $('#btn-imageretainer').on('click', () => {
        let d = new Dialog({
          title: game.i18n.localize('imageretainer.backup.title'),
          content: "<p>" + game.i18n.localize('imageretainer.backup.description') +"</p>",
          buttons: {
            run: {
              icon: '<i class="fas fa-check"></i>',
              label: game.i18n.localize('imageretainer.backup.run'),
              callback: backupPaths
            },
            cancel: {
              icon: '<i class="fas fa-times"></i>',
              label: game.i18n.localize('imageretainer.cancel'),
              callback: () => {}
            }
          },
          default: "run",
          render: () => {},
          close: () => {}
        });
        d.render(true);
      })
    });
});