import { useEffect, useState } from "react";

function App() {
  // =========================
  // STATE
  // =========================

  const [notes, setNotes] = useState(() => {
    const savedNotes = localStorage.getItem("notes");

    return savedNotes ? JSON.parse(savedNotes) : [];
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [color, setColor] = useState("yellow");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");

  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  // =========================
  // SAVE NOTES TO LOCAL STORAGE
  // =========================

  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes));
  }, [notes]);

  // =========================
  // ADD / UPDATE NOTE
  // =========================

  function handleSubmit(e) {
    e.preventDefault();

    // Content validation
    if (content.trim() === "") {
      setError("Content is required.");
      return;
    }

    // Title validation
    if (title.length > 100) {
      setError("Title cannot be more than 100 characters.");
      return;
    }

    // Content validation
    if (content.length > 1000) {
      setError("Content cannot be more than 1000 characters.");
      return;
    }

    // Tags validation
    if (tags.length > 100) {
      setError("Tags cannot be more than 100 characters.");
      return;
    }

    // Duplicate validation
    const duplicate = notes.some(
      (note) =>
        note.title.trim().toLowerCase() ===
          title.trim().toLowerCase() &&
        note.content.trim().toLowerCase() ===
          content.trim().toLowerCase() &&
        note.id !== editingId
    );

    if (duplicate) {
      setError("A note with the same title and content already exists.");
      return;
    }

    // UPDATE
    if (editingId !== null) {
      setNotes(
        notes.map((note) =>
          note.id === editingId
            ? {
                ...note,
                title: title.trim(),
                content: content.trim(),
                tags: tags.trim(),
                color: color,
                updatedAt: new Date().toISOString(),
              }
            : note
        )
      );

      setEditingId(null);
    }

    // CREATE
    else {
      const newNote = {
        id: Date.now(),
        title: title.trim(),
        content: content.trim(),
        tags: tags.trim(),
        color: color,
        pinned: false,
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setNotes([newNote, ...notes]);
    }

    clearForm();
  }

  // =========================
  // CLEAR FORM
  // =========================

  function clearForm() {
    setTitle("");
    setContent("");
    setTags("");
    setColor("yellow");
    setError("");
    setEditingId(null);
  }

  // =========================
  // EDIT NOTE
  // =========================

  function handleEdit(note) {
    setTitle(note.title);
    setContent(note.content);
    setTags(note.tags);
    setColor(note.color);

    setEditingId(note.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // =========================
  // DELETE NOTE
  // =========================

  function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this note?"
    );

    if (confirmDelete) {
      setNotes(notes.filter((note) => note.id !== id));
    }
  }

  // =========================
  // ARCHIVE / UNARCHIVE
  // =========================

  function handleArchive(id) {
    setNotes(
      notes.map((note) =>
        note.id === id
          ? {
              ...note,
              archived: !note.archived,
              updatedAt: new Date().toISOString(),
            }
          : note
      )
    );
  }

  // =========================
  // PIN / UNPIN
  // =========================

  function handlePin(id) {
    setNotes(
      notes.map((note) =>
        note.id === id
          ? {
              ...note,
              pinned: !note.pinned,
            }
          : note
      )
    );
  }

  // =========================
  // SEARCH + FILTER
  // =========================

  let filteredNotes = notes.filter((note) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      note.title.toLowerCase().includes(searchText) ||
      note.content.toLowerCase().includes(searchText) ||
      note.tags.toLowerCase().includes(searchText);

    let matchesFilter = true;

    if (filter === "active") {
      matchesFilter = !note.archived;
    }

    if (filter === "archived") {
      matchesFilter = note.archived;
    }

    if (filter === "pinned") {
      matchesFilter = note.pinned;
    }

    return matchesSearch && matchesFilter;
  });

  // =========================
  // SORT
  // =========================

  if (sort === "newest") {
    filteredNotes.sort(
      (a, b) =>
        new Date(b.createdAt) -
        new Date(a.createdAt)
    );
  }

  if (sort === "oldest") {
    filteredNotes.sort(
      (a, b) =>
        new Date(a.createdAt) -
        new Date(b.createdAt)
    );
  }

  if (sort === "title") {
    filteredNotes.sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }

  if (sort === "color") {
    filteredNotes.sort((a, b) =>
      a.color.localeCompare(b.color)
    );
  }

  // =========================
  // COLOR CLASSES
  // =========================

  const colorClasses = {
    yellow: "bg-yellow-100",
    blue: "bg-blue-100",
    green: "bg-green-100",
    pink: "bg-pink-100",
    purple: "bg-purple-100",
    orange: "bg-orange-100",
  };

  const colorButtons = {
    yellow: "bg-yellow-300",
    blue: "bg-blue-300",
    green: "bg-green-300",
    pink: "bg-pink-300",
    purple: "bg-purple-300",
    orange: "bg-orange-300",
  };

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-gray-100">

      {/* HEADER */}

      <header className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-5">
          <h1 className="text-3xl font-bold text-gray-800">
            My Notes
          </h1>

          <p className="text-gray-500">
            Keep your ideas organized
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* =========================
            NOTE FORM
        ========================= */}

        <div className="bg-white rounded-xl shadow p-5 mb-6">

          <h2 className="text-xl font-bold mb-4">
            {editingId !== null
              ? "Edit Note"
              : "Create New Note"}
          </h2>

          <form onSubmit={handleSubmit}>

            {/* TITLE */}

            <input
              type="text"
              placeholder="Title (optional)"
              value={title}
              maxLength={100}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              className="w-full border rounded-lg p-3 mb-1 outline-none focus:ring-2 focus:ring-blue-400"
            />

            <p className="text-xs text-gray-500 mb-3">
              {title.length}/100 characters
            </p>

            {/* CONTENT */}

            <textarea
              placeholder="Take a note..."
              value={content}
              maxLength={1000}
              onChange={(e) =>
                setContent(e.target.value)
              }
              rows="5"
              className="w-full border rounded-lg p-3 mb-1 outline-none focus:ring-2 focus:ring-blue-400"
            />

            <p className="text-xs text-gray-500 mb-3">
              {content.length}/1000 characters
            </p>

            {/* TAGS */}

            <input
              type="text"
              placeholder="Tags: study, work, personal"
              value={tags}
              maxLength={100}
              onChange={(e) =>
                setTags(e.target.value)
              }
              className="w-full border rounded-lg p-3 mb-4 outline-none focus:ring-2 focus:ring-blue-400"
            />

            {/* COLORS */}

            <p className="font-medium mb-2">
              Choose color
            </p>

            <div className="flex gap-3 mb-4">

              {Object.keys(colorButtons).map(
                (item) => (
                  <button
                    type="button"
                    key={item}
                    onClick={() =>
                      setColor(item)
                    }
                    className={`w-8 h-8 rounded-full ${
                      colorButtons[item]
                    } ${
                      color === item
                        ? "ring-4 ring-gray-400"
                        : ""
                    }`}
                  ></button>
                )
              )}

            </div>

            {/* ERROR */}

            {error && (
              <p className="text-red-500 mb-3">
                {error}
              </p>
            )}

            {/* BUTTONS */}

            <div className="flex gap-3">

              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg"
              >
                {editingId !== null
                  ? "Update Note"
                  : "Add Note"}
              </button>

              {editingId !== null && (
                <button
                  type="button"
                  onClick={clearForm}
                  className="bg-gray-200 hover:bg-gray-300 px-5 py-2 rounded-lg"
                >
                  Cancel
                </button>
              )}

            </div>

          </form>
        </div>

        {/* =========================
            SEARCH
        ========================= */}

        <div className="bg-white p-4 rounded-xl shadow mb-6">

          <input
            type="text"
            placeholder="Search notes..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full border rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-400"
          />

          <div className="flex flex-wrap gap-3 mt-4">

            {/* FILTER */}

            <select
              value={filter}
              onChange={(e) =>
                setFilter(e.target.value)
              }
              className="border rounded-lg p-2"
            >
              <option value="all">
                All Notes
              </option>

              <option value="active">
                Active
              </option>

              <option value="archived">
                Archived
              </option>

              <option value="pinned">
                Pinned
              </option>
            </select>

            {/* SORT */}

            <select
              value={sort}
              onChange={(e) =>
                setSort(e.target.value)
              }
              className="border rounded-lg p-2"
            >
              <option value="newest">
                Newest
              </option>

              <option value="oldest">
                Oldest
              </option>

              <option value="title">
                Title
              </option>

              <option value="color">
                Color
              </option>
            </select>

          </div>
        </div>

        {/* =========================
            NOTES
        ========================= */}

        {filteredNotes.length === 0 ? (

          /* EMPTY STATE */

          <div className="bg-white rounded-xl p-10 text-center">

            <h2 className="text-xl font-semibold text-gray-700">
              No notes found
            </h2>

            <p className="text-gray-500 mt-2">
              Create a new note to get started.
            </p>

          </div>

        ) : (

          /* NOTE GRID */

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            {filteredNotes.map((note) => (

              <div
                key={note.id}
                className={`rounded-xl p-5 shadow ${
                  colorClasses[note.color]
                }`}
              >

                {/* TITLE + PIN */}

                <div className="flex justify-between items-start">

                  <h2 className="text-xl font-bold text-gray-800">
                    {note.title || "Untitled"}
                  </h2>

                  <button
                    onClick={() =>
                      handlePin(note.id)
                    }
                    className="text-xl"
                  >
                    {note.pinned
                      ? "📌"
                      : "📍"}
                  </button>

                </div>

                {/* CONTENT */}

                <p className="text-gray-700 mt-3 whitespace-pre-wrap">
                  {note.content}
                </p>

                {/* TAGS */}

                {note.tags && (
                  <div className="mt-4">

                    {note.tags
                      .split(",")
                      .map((tag, index) => (

                        <span
                          key={index}
                          className="inline-block bg-white/70 text-gray-700 text-sm px-2 py-1 rounded mr-2 mb-2"
                        >
                          #{tag.trim()}
                        </span>

                      ))}

                  </div>
                )}

                {/* DATE */}

                <p className="text-xs text-gray-500 mt-3">
                  Created:{" "}
                  {new Date(
                    note.createdAt
                  ).toLocaleString()}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Updated:{" "}
                  {new Date(
                    note.updatedAt
                  ).toLocaleString()}
                </p>

                {/* ACTION BUTTONS */}

                <div className="flex gap-2 mt-4 flex-wrap">

                  <button
                    onClick={() =>
                      handleEdit(note)
                    }
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleArchive(note.id)
                    }
                    className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded"
                  >
                    {note.archived
                      ? "Unarchive"
                      : "Archive"}
                  </button>

                  <button
                    onClick={() =>
                      handleDelete(note.id)
                    }
                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </main>
    </div>
  );
}

export default App;