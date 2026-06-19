import { Hono } from "hono";
import type { HttpBindings } from "@hono/node-server";
import { serve } from "@hono/node-server";
import { serveStaticFiles } from "./lib/vite";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import path from "node:path";
import fs from "node:fs/promises";
import { verifyStudentSession } from "./student-session";
import { getDb } from "./queries/connection";
import {
  jupyterNotebooks,
  jupyterNotebookAccess,
  localUsers,
  roles,
  images,
} from "@db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

const app = new Hono<{ Bindings: HttpBindings }>();

// File upload endpoint for markdown images — stores files in the database
app.post("/api/upload/image", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body.file as File | undefined;
    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file provided" }, 400);
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: "Invalid file type" }, 400);
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      return c.json({ error: "File too large (max 5MB)" }, 400);
    }

    const db = getDb();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = path.extname(file.name) || ".png";
    const filename = `${Date.now()}-${nanoid(12)}${ext}`;

    const [result] = await db.insert(images).values({
      filename,
      originalName: file.name,
      mimeType: file.type,
      data: buffer.toString("base64"),
    });

    const id = Number(result.insertId);
    return c.json({ url: `/uploads/${id}/${filename}` });
  } catch (err) {
    console.error("Upload error:", err);
    return c.json({ error: "Upload failed" }, 500);
  }
});

// Serve uploaded images from the database
app.get("/uploads/:id/:filename", async (c) => {
  try {
    const id = Number(c.req.param("id"));
    if (!Number.isFinite(id) || id <= 0) {
      return c.json({ error: "Invalid image ID" }, 400);
    }

    const db = getDb();
    const [image] = await db
      .select()
      .from(images)
      .where(eq(images.id, id))
      .limit(1);

    if (!image) {
      return c.json({ error: "Not found" }, 404);
    }

    c.header("Content-Type", image.mimeType);
    c.header("Cache-Control", "public, max-age=86400");
    return c.body(Buffer.from(image.data, "base64"));
  } catch (err) {
    console.error("Image serve error:", err);
    return c.json({ error: "Failed to serve image" }, 500);
  }
});

// Fallback for legacy image links and filesystem uploads
app.get("/uploads/:filename", async (c) => {
  try {
    const filename = path.basename(c.req.param("filename"));
    const db = getDb();

    // First try to find the image in the database by filename
    const [image] = await db
      .select()
      .from(images)
      .where(eq(images.filename, filename))
      .limit(1);

    if (image) {
      c.header("Content-Type", image.mimeType);
      c.header("Cache-Control", "public, max-age=86400");
      return c.body(Buffer.from(image.data, "base64"));
    }

    // Fallback to filesystem for images uploaded before DB storage
    const filepath = path.join(process.cwd(), "public", "uploads", filename);
    const fileBuffer = await fs.readFile(filepath);
    const ext = path.extname(filename).toLowerCase();
    const mimeType =
      ext === ".png"
        ? "image/png"
        : ext === ".jpg" || ext === ".jpeg"
        ? "image/jpeg"
        : ext === ".gif"
        ? "image/gif"
        : ext === ".webp"
        ? "image/webp"
        : "application/octet-stream";

    c.header("Content-Type", mimeType);
    c.header("Cache-Control", "public, max-age=86400");
    return c.body(fileBuffer);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      return c.json({ error: "Not found" }, 404);
    }
    console.error("Legacy image serve error:", err);
    return c.json({ error: "Failed to serve image" }, 500);
  }
});

// File upload endpoint for Jupyter notebooks
app.post("/api/upload/jupyter", async (c) => {
  try {
    const body = await c.req.parseBody();
    const file = body.file as File | undefined;
    if (!file || !(file instanceof File)) {
      return c.json({ error: "No file provided" }, 400);
    }

    const ext = path.extname(file.name).toLowerCase();
    if (ext !== ".ipynb") {
      return c.json({ error: "Invalid file type. Only .ipynb files are allowed." }, 400);
    }

    const maxSize = 20 * 1024 * 1024; // 20 MB
    if (file.size > maxSize) {
      return c.json({ error: "File too large (max 20MB)" }, 400);
    }

    const uploadsDir = path.join(process.cwd(), "uploads", "jupyter");
    await fs.mkdir(uploadsDir, { recursive: true });

    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filepath = path.join(uploadsDir, filename);

    const arrayBuffer = await file.arrayBuffer();
    await fs.writeFile(filepath, Buffer.from(arrayBuffer));

    return c.json({
      filename: file.name,
      storedFilename: filename,
      url: `uploads/jupyter/${filename}`,
    });
  } catch (err) {
    console.error("Jupyter upload error:", err);
    return c.json({ error: "Upload failed" }, 500);
  }
});

// ── Secure Jupyter notebook download for students ──
app.get("/api/jupyter/download/:id", async (c) => {
  try {
    const notebookId = Number(c.req.param("id"));
    if (!Number.isFinite(notebookId) || notebookId <= 0) {
      return c.json({ error: "Invalid notebook ID" }, 400);
    }

    // Verify student session
    const session = await verifyStudentSession(c.req.raw.headers);
    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const db = getDb();

    // Check role
    const user = await db
      .select({ roleId: localUsers.roleId })
      .from(localUsers)
      .where(eq(localUsers.id, session.localUserId))
      .limit(1);

    if (!user[0]) {
      return c.json({ error: "User not found" }, 404);
    }

    const role = await db
      .select({ name: roles.name })
      .from(roles)
      .where(eq(roles.id, user[0].roleId))
      .limit(1);

    const isAdmin = role[0]?.name === "admin";

    if (!isAdmin) {
      // Check notebook access for students
      const access = await db
        .select()
        .from(jupyterNotebookAccess)
        .where(
          and(
            eq(jupyterNotebookAccess.notebookId, notebookId),
            eq(jupyterNotebookAccess.localUserId, session.localUserId)
          )
        )
        .limit(1);

      if (!access[0]) {
        return c.json({ error: "Forbidden" }, 403);
      }
    }

    // Get notebook
    const notebook = await db
      .select()
      .from(jupyterNotebooks)
      .where(eq(jupyterNotebooks.id, notebookId))
      .limit(1);

    if (!notebook[0]) {
      return c.json({ error: "Not found" }, 404);
    }

    // Read file
    const filePath = path.join(process.cwd(), notebook[0].filePath);
    const fileBuffer = await fs.readFile(filePath);

    c.header("Content-Type", "application/octet-stream");
    c.header(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(notebook[0].filename)}"`
    );
    return c.body(fileBuffer);
  } catch (err) {
    console.error("Jupyter download error:", err);
    return c.json({ error: "Download failed" }, 500);
  }
});

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});
app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

if (process.env.NODE_ENV === "production") {
  serveStaticFiles(app);
  const port = Number(process.env.PORT) || 3000;
  serve({ fetch: app.fetch, port });
  console.log(`Server running on port ${port}`);
}

export default app;
