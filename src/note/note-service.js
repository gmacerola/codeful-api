const NoteService = {
  getAllNotes(knex) {
    return knex.select("*").from("notes");
  },
  insertNote(knex, newNote) {
    return knex
      .insert(newNote)
      .into("notes")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },
  getAllNotesByUser(knex, user_id) {
    return knex
      .from("folders")
      .select("id")
      .where({ user_id })
      .then((rows) => {
        const folderIds = rows.map((r) => r.id);
        return knex.from("notes").select("*").whereIn("folder_id", folderIds);
      });
  },
  getById(knex, id) {
    return knex.from("notes").select("*").where({ id }).first();
  },
  deleteNote(knex, id) {
    return knex("notes").where({ id }).delete();
  },
  updateArticle(knex, id, newNoteFields) {
    return knex("notes").where({ id }).update(newNoteFields);
  },
};

module.exports = NoteService;
