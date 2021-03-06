const path = require("path");
const express = require("express");
const xss = require("xss");
const NoteService = require("./note-service");
const { requireAuth } = require("../middleware/jwt-auth");

const noteRouter = express.Router();
const jsonParser = express.json();

const serializeNote = (note) => ({
  ...note,
  id: note.id,
  title: xss(note.title),
  content: xss(note.content),
  modified: note.modified,
  folder_id: note.folder_id,
});

noteRouter
  .route("/")
  .get(requireAuth, (req, res, next) => {
    const knexInstance = req.app.get("db");
    NoteService.getAllNotesByUser(knexInstance, req.user.id)
      .then((notes) => {
        res.json(notes.map(serializeNote));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const { title, content, folder_id } = req.body;
    const newNote = { title, content, folder_id };

    for (const [key, value] of Object.entries(newNote))
      if (value == null)
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` },
        });
    NoteService.insertNote(req.app.get("db"), newNote)
      .then((note) => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(serializeNote(note));
      })
      .catch(next);
  });

noteRouter
  .route("/:note_id")
  .all((req, res, next) => {
    NoteService.getById(req.app.get("db"), req.params.note_id)
      .then((note) => {
        if (!note) {
          return res.status(404).json({
            error: { message: `Note doesn't exist` },
          });
        }
        res.note = note;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeNote(res.note));
  })
  .delete((req, res, next) => {
    NoteService.deleteNote(req.app.get("db"), req.params.note_id)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { title, content } = req.body;
    const noteToUpdate = { title, content };

    const numberOfValues = Object.values(noteToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'title' or 'content'`,
        },
      });
    }

    NoteService.updateNote(req.app.get("db"), req.params.note_id, noteToUpdate)
      .then((numRowsAffected) => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = noteRouter;
