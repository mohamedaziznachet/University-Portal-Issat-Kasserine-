const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadRoot = path.resolve(process.cwd(), "uploads");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const folder = path.join(uploadRoot, file.fieldname);
    ensureDir(folder);
    cb(null, folder);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-").toLowerCase();
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const upload = multer({ storage });

module.exports = upload;
