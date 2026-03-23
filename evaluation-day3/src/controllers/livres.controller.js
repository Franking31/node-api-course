const livresService = require("../services/livres.service");

async function getAll(req, res, next) {
  try {
    const livres = await livresService.getAll();
    res.json({ success: true, count: livres.length, data: livres });
  } catch (err) { next(err); }
}


async function getById(req, res, next) {
  try {
    const livre = await livresService.getById(parseInt(req.params.id));
    res.json({ success: true, data: livre });
  } catch (err) { next(err); }
}

async function create(req, res, next) {
  try {
    const livre = await livresService.create(req.body);
    res.status(201).json({ success: true, data: livre });
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const livre = await livresService.update(parseInt(req.params.id), req.body);
    res.json({ success: true, data: livre });
  } catch (err) { next(err); }
}

async function remove(req, res, next) {
  try {
    await livresService.remove(parseInt(req.params.id));
    res.json({ success: true, message: "Livre supprime" });
  } catch (err) { next(err); }
}

async function emprunter(req, res, next) {
  try {
    const emprunt = await livresService.emprunter(parseInt(req.params.id), req.user.id);
    res.status(201).json({ success: true, data: emprunt });
  } catch (err) { next(err); }
}

async function retourner(req, res, next) {
  try {
    const emprunt = await livresService.retourner(parseInt(req.params.id), req.user.id);
    res.json({ success: true, data: emprunt });
  } catch (err) { next(err); }
}

module.exports = { getAll, getById, create, update, remove, emprunter, retourner };