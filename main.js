import {restorePaths,getFiles} from "./backup.js";

const MODULE_NAME = "imageretainer";

Hooks.on('ready', init);

async function init() {
  if (!game.user.isGM)
    return;

  let system = game.system.id;
  let path = MODULE_NAME + '/' + system;

  game.settings.register(MODULE_NAME, "systemVersion", {
    name: "Last System Version",
    hint: "Used to reapply images.",
    config: false,
    default: game.system.version,
    scope: "world",
    type: String
  });

  game.settings.register(MODULE_NAME, "systemOnly", {
    name: game.i18n.localize('imageretainer.settings.systemOnly.title'),
    hint: game.i18n.localize('imageretainer.settings.systemOnly.description'),
    config: true,
    default: true,
    scope: "world",
    type: Boolean
  });

  game.settings.register(MODULE_NAME, "ignoreSVG", {
    name: game.i18n.localize('imageretainer.settings.ignoreSVG.title'),
    hint: game.i18n.localize('imageretainer.settings.ignoreSVG.description'),
    config: true,
    default: true,
    scope: "world",
    type: Boolean
  });

  game.settings.register(MODULE_NAME, "ignoreFoundry", {
    name: game.i18n.localize('imageretainer.settings.ignoreFoundry.title'),
    hint: game.i18n.localize('imageretainer.settings.ignoreFoundry.description'),
    config: true,
    default: true,
    scope: "world",
    type: Boolean
  });

  await FilePicker.browse("data", MODULE_NAME).catch(() => FilePicker.createDirectory("data", MODULE_NAME));
  await FilePicker.browse("data", path).catch(() => FilePicker.createDirectory("data", path));

  let files = await getFiles();

  console.log('Image retainer detected ' + files.length + ' patch files in ' + path);

  if (files.length && game.system.version !== game.settings.get(MODULE_NAME, "systemVersion")) {
    console.log('System version change detected. System Version: ' + game.system.version + ' Last Seen: ' + game.settings.get(MODULE_NAME, "systemVersion"));
    let d = new Dialog({
      title: game.i18n.localize('imageretainer.restore.title'),
      content: "<p>" + game.i18n.localize('imageretainer.restore.newVersion') +"</p>",
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
      close: () => {
        game.settings.set(MODULE_NAME, "systemVersion", game.system.version);
      }
    });
    d.render(true);
  }
}

export { MODULE_NAME }