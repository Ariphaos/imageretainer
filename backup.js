
import {MODULE_NAME} from "./main.js"

async function exportPack(outPack, type) {
  const path = MODULE_NAME + '/' + game.system.id + '/';

  const pack = game.packs.get(outPack);
  const actors = await pack.getDocuments();
  const mappedImages = actors.map(a => {
    if (game.settings.get(MODULE_NAME, "ignoreSVG") && a.img.substring(0, 10) === "icons/svg/") return;
    if (game.settings.get(MODULE_NAME, "ignoreFoundry") && a.img.substring(0, 6) === "icons/" && a.img.substring(0, 10) !== "icons/svg/") return;
    if (a.img.substring(0, 8) === "systems/") return;
    if (a.img.substring(0, 8) === "modules/") return;

    switch (type) {
      case 'Actor':
        return ({id: a.id, img: a.img, prototypeToken: { randomImg: a.prototypeToken.randomImg, texture: a.prototypeToken.texture }})
      case 'Item':
        return ({id: a.id, img: a.img});
    }

  }).filter(e => { return e; });
  if (mappedImages.length) {
    const fileName = encodeURI(`${outPack}.json`);
    const file = new File([JSON.stringify(mappedImages, null, '')], fileName, { type: 'application/json'});
    await FilePicker.upload('data', path, file);
  }
}

async function importMapping(gamePack) {
  const filePath = MODULE_NAME + '/' + game.system.id + '/' + gamePack + '.json';
  try {
    let response = await fetch(filePath), updates;
    let updateData = await response.json();
    // console.log(updateData);
    const pack = game.packs.get(gamePack);

    switch (pack.documentName) {
      case 'Actor':
        updates = updateData.map(a =>{
          if (a.hasOwnProperty("data")) {
            // Old version import
            return {
              _id: a.id,
              img: a.img,
              prototypeToken: {
                randomImg: a.data.token.randomImg,
                texture: {
                  src: a.data.token.img,
                  scaleX: a.data.token.scale,
                  scaleY: a.data.token.scale
                }
              }
            };
          }
          else if (a.hasOwnProperty("prototypeToken")) {
            return {
              _id: a.id,
              img: a.img,
              prototypeToken: {
                randomImg: a.prototypeToken.randomImg,
                texture: a.prototypeToken.texture
              }
            };
          }
        });
        break;
      case 'Item':
        updates = updateData.map(a => ({_id: a.id, img: a.img}));
        break;
      default: updates = false;
        console.log('Unsupported compendium type: ' + pack.documentName);
    }
    if (updates) {
      let relockPack = false;
      if (pack.locked) {
        await pack.configure({locked: false});
        relockPack = true;
      }
      await pack.getDocuments();
      switch (pack.documentName) {
        case 'Actor':
          await Actor.updateDocuments(updates, {pack: gamePack});
          break;
        case 'Item':
          await Item.updateDocuments(updates, {pack: gamePack});
          break;
      }
      if (relockPack) {
        await pack.configure({locked: true});
      }
      //ui.notifications.info(`Image Retainer: ${gamePack} imported.`);
    }

  } catch (e) {
    console.error(`Error: ${e} when attempting to patch ${gamePack}. The pack may not exist in this world or it may be damaged.`);
  }
}

async function getFiles() {
  const path = MODULE_NAME + '/' + game.system.id;
  const folderList = await FilePicker.browse('data',path);
  let files = folderList.files.filter(f => f.endsWith('.json'));

  if (game.settings.get(MODULE_NAME, "systemOnly")) {
    files = files.filter(f => f.startsWith(path + '/' + game.system.id + '.'));
  }

  return files;
}

async function notifyStatus(message) {
  ui.notifications.info(game.i18n.localize(message));
  ChatMessage.create({
    speaker: {alias: MODULE_NAME + ' Notification'},
    content: game.i18n.localize(message),
    whisper: [game.user.id],
    timestamp: Date.now()
  });
}

async function restorePaths() {
  await notifyStatus('imageretainer.notify.startRestore');

  let files = await getFiles();

  for (let file of files) {
    await importMapping(file.split('/').slice(-1)[0].slice(0,-5));
  }

  await notifyStatus('imageretainer.notify.finishRestore');
}

async function backupPaths() {
  await notifyStatus('imageretainer.notify.startBackup');

  const actorPacks = game.packs.filter((pack) => {
    if (game.settings.get(MODULE_NAME, "systemOnly")) {
      return pack.metadata.packageName === game.system.id && pack.metadata.packageType === "system" && pack.documentName === "Actor";
    }
    else {
      return pack.documentName === "Actor";
    }
  });

  for (let pack of actorPacks) {
    await exportPack(pack.collection, pack.documentName);
  }

  const itemPacks = game.packs.filter((pack) => {
    if (game.settings.get(MODULE_NAME, "systemOnly")) {
      return pack.metadata.packageName === game.system.id && pack.metadata.packageType === "system" && pack.documentName === "Item";
    }
    else {
      return pack.documentName === "Item";
    }
  });

  for (let pack of itemPacks) {
    await exportPack(pack.collection, pack.documentName);
  }

  await notifyStatus('imageretainer.notify.finishBackup');
}

export { restorePaths, backupPaths, getFiles };