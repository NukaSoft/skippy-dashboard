/**
 * Overseer's Dashboard — GTD + PARA REST API
 *
 * GTD for processing and managing. PARA for execution and flow state.
 * One abstraction layer over everything Pierre runs.
 */
const { Router } = require("express");
const { db, gtdStmts } = require("../db");
const { broadcast } = require("../websocket");

const router = Router();

// ─── Stats ───────────────────────────────────────────────────
router.get("/stats", (_req, res) => {
  res.json(gtdStmts.gtdStats.get());
});

// ─── Captures (raw inbox) ────────────────────────────────────
router.get("/captures", (_req, res) => {
  res.json({ captures: gtdStmts.listCaptures.all() });
});

router.post("/captures", (req, res) => {
  const { raw_text, source = "manual", source_ref } = req.body;
  if (!raw_text) return res.status(400).json({ error: "raw_text required" });

  const result = gtdStmts.insertCapture.run(raw_text, source, source_ref || null);
  const capture = db.prepare("SELECT * FROM gtd_captures WHERE id = ?").get(result.lastInsertRowid);
  broadcast("gtd_capture", capture);
  res.status(201).json(capture);
});

router.post("/captures/:id/process", (req, res) => {
  const { title, item_type = "next_action", ...rest } = req.body;
  if (!title) return res.status(400).json({ error: "title required" });

  const tx = db.transaction(() => {
    const itemResult = gtdStmts.insertItem.run({
      title,
      body: rest.body || null,
      item_type,
      status: "active",
      para_type: rest.para_type || null,
      context: rest.context || null,
      energy_level: rest.energy_level || null,
      time_estimate: rest.time_estimate || null,
      due_date: rest.due_date || null,
      scheduled_date: rest.scheduled_date || null,
      delegated_to: rest.delegated_to || null,
      delegated_date: rest.delegated_date || null,
      follow_up_date: rest.follow_up_date || null,
      source: rest.source || null,
      source_ref: rest.source_ref || null,
      parent_id: rest.parent_id || null,
      area_id: rest.area_id || null,
      sort_order: rest.sort_order || 0,
    });
    const itemId = itemResult.lastInsertRowid;
    gtdStmts.processCapture.run(itemId, parseInt(req.params.id));
    gtdStmts.logActivity.run(itemId, "clarified", null, JSON.stringify({ from_capture: req.params.id }), "pierre");
    return gtdStmts.getItem.get(itemId);
  });

  const item = tx();
  broadcast("gtd_item_created", item);
  res.status(201).json(item);
});

// ─── Items (the GTD spine) ───────────────────────────────────
router.get("/items", (req, res) => {
  const { type, status, area_id, delegated_to, context, limit = 200, offset = 0 } = req.query;
  const items = gtdStmts.listItems.all({
    type: type || null,
    status: status || null,
    area_id: area_id ? parseInt(area_id) : null,
    delegated_to: delegated_to || null,
    context: context || null,
    limit: Math.min(parseInt(limit), 1000),
    offset: parseInt(offset) || 0,
  });
  res.json({ items });
});

router.get("/items/:id", (req, res) => {
  const item = gtdStmts.getItem.get(parseInt(req.params.id));
  if (!item) return res.status(404).json({ error: "not found" });

  item.tags = gtdStmts.getItemTags.all(item.id);
  res.json(item);
});

router.post("/items", (req, res) => {
  const { title, tags, ...rest } = req.body;
  if (!title) return res.status(400).json({ error: "title required" });

  const tx = db.transaction(() => {
    const result = gtdStmts.insertItem.run({
      title,
      body: rest.body || null,
      item_type: rest.item_type || "inbox",
      status: rest.status || "active",
      para_type: rest.para_type || null,
      context: rest.context || null,
      energy_level: rest.energy_level || null,
      time_estimate: rest.time_estimate || null,
      due_date: rest.due_date || null,
      scheduled_date: rest.scheduled_date || null,
      delegated_to: rest.delegated_to || null,
      delegated_date: rest.delegated_date || null,
      follow_up_date: rest.follow_up_date || null,
      source: rest.source || null,
      source_ref: rest.source_ref || null,
      parent_id: rest.parent_id || null,
      area_id: rest.area_id || null,
      sort_order: rest.sort_order || 0,
    });
    const itemId = result.lastInsertRowid;

    // Attach tags by name
    if (tags && Array.isArray(tags)) {
      for (const tagName of tags) {
        const tag = gtdStmts.getTagByName.get(tagName);
        if (tag) gtdStmts.addItemTag.run(itemId, tag.id);
      }
    }

    gtdStmts.logActivity.run(itemId, "created", null, JSON.stringify({ item_type: rest.item_type || "inbox" }), rest.actor || "skippy");
    return gtdStmts.getItem.get(itemId);
  });

  const item = tx();
  broadcast("gtd_item_created", item);
  res.status(201).json(item);
});

router.patch("/items/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const existing = gtdStmts.getItem.get(id);
  if (!existing) return res.status(404).json({ error: "not found" });

  const { tags, actor, ...fields } = req.body;

  const tx = db.transaction(() => {
    // Provide all named params — null means "keep existing" via COALESCE
    gtdStmts.updateItem.run({
      id,
      title: fields.title || null,
      body: fields.body || null,
      item_type: fields.item_type || null,
      status: fields.status || null,
      para_type: fields.para_type || null,
      context: fields.context || null,
      energy_level: fields.energy_level || null,
      time_estimate: fields.time_estimate || null,
      due_date: fields.due_date || null,
      scheduled_date: fields.scheduled_date || null,
      delegated_to: fields.delegated_to || null,
      follow_up_date: fields.follow_up_date || null,
      parent_id: fields.parent_id || null,
      area_id: fields.area_id || null,
      sort_order: fields.sort_order != null ? fields.sort_order : null,
    });

    if (tags && Array.isArray(tags)) {
      gtdStmts.clearItemTags.run(id);
      for (const tagName of tags) {
        const tag = gtdStmts.getTagByName.get(tagName);
        if (tag) gtdStmts.addItemTag.run(id, tag.id);
      }
    }

    // Log type changes
    if (fields.item_type && fields.item_type !== existing.item_type) {
      gtdStmts.logActivity.run(id, "moved", existing.item_type, fields.item_type, actor || "skippy");
    }
    if (fields.status && fields.status !== existing.status) {
      gtdStmts.logActivity.run(id, "status_changed", existing.status, fields.status, actor || "skippy");
    }

    return gtdStmts.getItem.get(id);
  });

  const item = tx();
  broadcast("gtd_item_updated", item);
  res.json(item);
});

router.patch("/items/:id/move", (req, res) => {
  const id = parseInt(req.params.id);
  const { item_type } = req.body;
  if (!item_type) return res.status(400).json({ error: "item_type required" });

  const existing = gtdStmts.getItem.get(id);
  if (!existing) return res.status(404).json({ error: "not found" });

  const tx = db.transaction(() => {
    gtdStmts.updateItem.run({ id, item_type, title: null, body: null, status: null, para_type: null, context: null, energy_level: null, time_estimate: null, due_date: null, scheduled_date: null, delegated_to: null, follow_up_date: null, parent_id: null, area_id: null, sort_order: null });
    gtdStmts.logActivity.run(id, "moved", existing.item_type, item_type, req.body.actor || "pierre");
    return gtdStmts.getItem.get(id);
  });

  const item = tx();
  broadcast("gtd_item_moved", { item, from: existing.item_type, to: item_type });
  res.json(item);
});

router.patch("/items/:id/complete", (req, res) => {
  const id = parseInt(req.params.id);
  const existing = gtdStmts.getItem.get(id);
  if (!existing) return res.status(404).json({ error: "not found" });

  gtdStmts.completeItem.run(id);
  gtdStmts.logActivity.run(id, "completed", existing.status, "completed", req.body?.actor || "pierre");

  // Resolve any waiting_for entries
  gtdStmts.resolveWaiting.run(id);

  const item = gtdStmts.getItem.get(id);
  broadcast("gtd_item_completed", item);
  res.json(item);
});

router.delete("/items/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const existing = gtdStmts.getItem.get(id);
  if (!existing) return res.status(404).json({ error: "not found" });

  gtdStmts.archiveItem.run(id);
  gtdStmts.logActivity.run(id, "archived", existing.status, "archived", "pierre");
  broadcast("gtd_item_archived", { id });
  res.json({ archived: true });
});

// ─── Areas ───────────────────────────────────────────────────
router.get("/areas", (_req, res) => {
  const areas = gtdStmts.listAreas.all();
  res.json({ areas });
});

router.post("/areas", (req, res) => {
  const { name, description, standard, parent_area_id } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });

  const result = gtdStmts.insertArea.run(name, description || null, standard || null, parent_area_id || null);
  const area = gtdStmts.getArea.get(result.lastInsertRowid);
  broadcast("gtd_area_created", area);
  res.status(201).json(area);
});

router.patch("/areas/:id", (req, res) => {
  const { name, description, standard, status } = req.body;
  gtdStmts.updateArea.run(name || null, description || null, standard || null, status || null, parseInt(req.params.id));
  const area = gtdStmts.getArea.get(parseInt(req.params.id));
  broadcast("gtd_area_updated", area);
  res.json(area);
});

// ─── Tags ────────────────────────────────────────────────────
router.get("/tags", (_req, res) => {
  res.json({ tags: gtdStmts.listTags.all() });
});

router.post("/tags", (req, res) => {
  const { name, tag_type = "custom", color } = req.body;
  if (!name) return res.status(400).json({ error: "name required" });

  const result = gtdStmts.insertTag.run(name, tag_type, color || null);
  const tag = db.prepare("SELECT * FROM gtd_tags WHERE id = ?").get(result.lastInsertRowid);
  res.status(201).json(tag);
});

// ─── People ──────────────────────────────────────────────────
router.get("/people", (_req, res) => {
  res.json({ people: gtdStmts.listPeople.all() });
});

// ─── Projects ────────────────────────────────────────────────
router.get("/projects", (_req, res) => {
  res.json({ projects: gtdStmts.listProjects.all() });
});

router.post("/projects", (req, res) => {
  const { title, desired_outcome, area_id, deadline, review_date, ...itemFields } = req.body;
  if (!title || !desired_outcome) return res.status(400).json({ error: "title and desired_outcome required" });

  const tx = db.transaction(() => {
    const itemResult = gtdStmts.insertItem.run({
      title,
      body: itemFields.body || null,
      item_type: "project",
      status: "active",
      para_type: "project",
      context: null,
      energy_level: null,
      time_estimate: null,
      due_date: deadline || null,
      scheduled_date: null,
      delegated_to: null,
      delegated_date: null,
      follow_up_date: null,
      source: itemFields.source || null,
      source_ref: null,
      parent_id: null,
      area_id: area_id || null,
      sort_order: 0,
    });
    const itemId = itemResult.lastInsertRowid;
    gtdStmts.insertProject.run(itemId, desired_outcome, area_id || null, deadline || null, review_date || null);
    gtdStmts.logActivity.run(itemId, "created", null, "project", "pierre");
    return { item: gtdStmts.getItem.get(itemId) };
  });

  const result = tx();
  broadcast("gtd_project_created", result);
  res.status(201).json(result);
});

// ─── Waiting For ─────────────────────────────────────────────
router.get("/waiting", (_req, res) => {
  res.json({ waiting: gtdStmts.listWaiting.all() });
});

// ─── Delegate (create waiting_for item in one call) ──────────
router.post("/delegate", (req, res) => {
  const { title, delegated_to, expected_date, follow_up_date, notes, ...rest } = req.body;
  if (!title || !delegated_to) return res.status(400).json({ error: "title and delegated_to required" });

  const tx = db.transaction(() => {
    // Find or default person
    const person = gtdStmts.getPersonByName.get(delegated_to);

    const itemResult = gtdStmts.insertItem.run({
      title,
      body: rest.body || null,
      item_type: "waiting_for",
      status: "active",
      para_type: rest.para_type || null,
      context: null,
      energy_level: null,
      time_estimate: null,
      due_date: expected_date || null,
      scheduled_date: null,
      delegated_to,
      delegated_date: new Date().toISOString().split("T")[0],
      follow_up_date: follow_up_date || null,
      source: rest.source || "claude",
      source_ref: rest.source_ref || null,
      parent_id: rest.parent_id || null,
      area_id: rest.area_id || null,
      sort_order: 0,
    });
    const itemId = itemResult.lastInsertRowid;

    gtdStmts.insertWaiting.run(
      itemId,
      person ? person.id : null,
      expected_date || null,
      follow_up_date || null,
      notes || null
    );

    gtdStmts.logActivity.run(itemId, "delegated", null, JSON.stringify({ to: delegated_to }), rest.actor || "skippy");
    return gtdStmts.getItem.get(itemId);
  });

  const item = tx();
  broadcast("gtd_delegated", item);
  res.status(201).json(item);
});

// ─── Reviews ─────────────────────────────────────────────────
router.get("/reviews/latest", (req, res) => {
  const type = req.query.type || "weekly";
  const review = gtdStmts.getLastReview.get(type);
  const stats = gtdStmts.gtdStats.get();
  res.json({ review, stats });
});

router.post("/reviews", (req, res) => {
  const { type = "weekly" } = req.body;
  const result = gtdStmts.insertReview.run(type);
  const review = db.prepare("SELECT * FROM gtd_reviews WHERE id = ?").get(result.lastInsertRowid);
  broadcast("gtd_review_started", review);
  res.status(201).json(review);
});

router.patch("/reviews/:id/complete", (req, res) => {
  const { notes, inbox_cleared, projects_reviewed, waiting_reviewed, someday_reviewed, calendar_reviewed } = req.body;
  gtdStmts.completeReview.run(
    notes || null,
    inbox_cleared ? 1 : 0,
    projects_reviewed ? 1 : 0,
    waiting_reviewed ? 1 : 0,
    someday_reviewed ? 1 : 0,
    calendar_reviewed ? 1 : 0,
    parseInt(req.params.id)
  );
  const review = db.prepare("SELECT * FROM gtd_reviews WHERE id = ?").get(parseInt(req.params.id));
  broadcast("gtd_review_completed", review);
  res.json(review);
});

// ─── Resources / Canon ───────────────────────────────────────
router.get("/resources", (_req, res) => {
  res.json({ resources: gtdStmts.listResources.all() });
});

router.get("/canon", (_req, res) => {
  res.json({ canon: gtdStmts.listCanon.all() });
});

// ─── Activity Log ────────────────────────────────────────────
router.get("/activity", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 500);
  const rows = db.prepare("SELECT * FROM gtd_activity_log ORDER BY created_at DESC LIMIT ?").all(limit);
  res.json({ activity: rows });
});

module.exports = router;
