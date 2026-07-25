const prisma = require("../config/db");

async function uploadDocument(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const { customerId } = req.body;
    const document = await prisma.document.create({
      data: {
        customerId: Number(customerId),
        fileName: req.file.originalname,
        filePath: req.file.filename,
      },
    });
    res.status(201).json(document);
  } catch (err) {
    res.status(500).json({ message: "Error uploading document", error: err.message });
  }
}

async function getDocuments(req, res) {
  try {
    const { customerId } = req.query;
    const documents = await prisma.document.findMany({
      where: customerId ? { customerId: Number(customerId) } : undefined,
      orderBy: { id: "desc" },
    });
    res.json(documents);
  } catch (err) {
    res.status(500).json({ message: "Error fetching documents", error: err.message });
  }
}

module.exports = { uploadDocument, getDocuments };