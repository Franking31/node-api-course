const { readDB, writeDB } = require("./db");

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("JSON invalide"));
      }
    });
    req.on("error", reject);
  });
}

async function router(req, res) {
  const urlObj = new URL(req.url, `http://${req.headers.host}`);
  const pathname = urlObj.pathname;
  const method = req.method;

  // GET /books
  if (method === "GET" && pathname === "/books") {
    const db = await readDB();

    // Bonus filtrage par disponibilité 
    const availableParam = urlObj.searchParams.get("available");
    let books = db.books;
    if (availableParam !== null) {
      const filterValue = availableParam === "true";
      books = books.filter((b) => b.available === filterValue);
    }

    return sendJSON(res, 200, { success: true, count: books.length, data: books });
  }

  // GET /books/:id
  const matchId = pathname.match(/^\/books\/(\d+)$/);
  if (method === "GET" && matchId) {
    const id = parseInt(matchId[1]);
    const db = await readDB();
    const book = db.books.find((b) => b.id === id);

    if (!book) {
      return sendJSON(res, 404, { success: false, error: "Livre introuvable" });
    }
    return sendJSON(res, 200, { success: true, data: book });
  }

  // POST /books
  if (method === "POST" && pathname === "/books") {
    const body = await parseBody(req);
    const { title, author, year } = body;

    if (!title || !author || !year) {
      return sendJSON(res, 400, {
        success: false,
        error: "Les champs titre, auteur et annee sont requis",
      });
    }

    const db = await readDB();
    const newId = db.books.length > 0 ? Math.max(...db.books.map((b) => b.id)) + 1 : 1;
    const newBook = { id: newId, title, author, year, available: true };

    db.books.push(newBook);
    await writeDB(db);

    return sendJSON(res, 201, { success: true, data: newBook });
  }

  // Bonus: DELETE /books/:id
  const matchDelete = pathname.match(/^\/books\/(\d+)$/);
  if (method === "DELETE" && matchDelete) {
    const id = parseInt(matchDelete[1]);
    const db = await readDB();
    const index = db.books.findIndex((b) => b.id === id);

    if (index === -1) {
      return sendJSON(res, 404, { success: false, error: "Livre introuvable" });
    }

    const deleted = db.books.splice(index, 1)[0];
    await writeDB(db);

    return sendJSON(res, 200, { success: true, data: deleted });
  }

  // Route 404 par défaut
  return sendJSON(res, 404, { success: false, error: "Route non trouvée" });
}

module.exports = { router };