
import {MODULE_NAME} from "./main.js"

async function exportPack(outPack, type) {
  const path = MODULE_NAME + '/' + game.system.id + '/';

  const pack = game.packs.get(outPack);
  const actors = await pack.getDocuments();
  const mappedImages = actors.map(a => {
    let systemPath = 'systems/' + game.system.id + '/';
    if (game.settings.get(MODULE_NAME, "ignoreSVG") && a.img.substr(0, 10) === "icons/svg/") return;
    if (game.settings.get(MODULE_NAME, "ignoreFoundry") && a.img.substr(0, 6) === "icons/" && a.img.substr(0, 10) !== "icons/svg/") return;
    if (a.img.substr(0, systemPath.length) === systemPath) return;

    switch (type) {
      case 'Actor':
        return ({id: a.id, img: a.img, data: { token: { img: a.data.token.img, randomImg: a.data.token.randomImg, scale: a.data.token.scale}}})
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
    console.log(updateData);
    const pack = game.packs.get(gamePack);

    switch (pack.documentName) {
      case 'Actor':
        updates = updateData.map(a => ({_id: a.id, img: a.img, token: { img: a.data.token.img, randomImg: a.data.token.randomImg, scale: a.data.token.scale }}));
        break;
      case 'Item':
        updates = updateData.map(a => ({_id: a.id, img: a.img}));
        break;
      default: updates = false;
        console.log('Unsupported compendium type: ' + pack.documentName);
    }
    if (updates) {
      await pack.configure({locked: false});
      await pack.getDocuments();
      switch (pack.documentName) {
        case 'Actor':
          await Actor.updateDocuments(updates, {pack: gamePack});
          break;
        case 'Item':
          await Item.updateDocuments(updates, {pack: gamePack});
          break;
      }
      await pack.configure({locked: true});
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

async function restorePaths() {
  ui.notifications.info(game.i18n.localize('imageretainer.notify.startRestore'));
  await ChatMessage.create({content: game.i18n.localize('imageretainer.notify.startRestore') });

  let files = await getFiles();

  for (let file of files) {
    await importMapping(file.split('/').slice(-1)[0].slice(0,-5));
  }

  ui.notifications.info(game.i18n.localize('imageretainer.notify.finishRestore'));
  await ChatMessage.create({ content: game.i18n.localize('imageretainer.notify.finishRestore') });
}

async function backupPaths() {

  ui.notifications.info(game.i18n.localize('imageretainer.notify.startBackup'));
  await ChatMessage.create({content: game.i18n.localize('imageretainer.notify.startBackup') });

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

  ui.notifications.info(game.i18n.localize('imageretainer.notify.finishBackup'));
  await ChatMessage.create({content: game.i18n.localize('imageretainer.notify.finishBackup') });
}

export { restorePaths, backupPaths, getFiles };