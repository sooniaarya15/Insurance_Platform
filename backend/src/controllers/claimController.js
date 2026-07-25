const prisma = require("../config/db");

async function submitClaim(req, res) {
  try {
    const { policyId, claimAmount, reason } = req.body;
    const claim = await prisma.claim.create({
      data: {
        policyId: Number(policyId),
        claimAmount: Number(claimAmount),
        reason,
        status: "PENDING",
      },
    });
    res.status(201).json(claim);
  } catch (err) {
    res.status(500).json({ message: "Error submitting claim", error: err.message });
  }
}

async function getClaims(req, res) {
  try {
    const { status } = req.query;
    const claims = await prisma.claim.findMany({
      where: status ? { status } : undefined,
      include: { policy: { include: { customer: true } } },
      orderBy: { id: "desc" },
    });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: "Error fetching claims", error: err.message });
  }
}

async function getClaimById(req, res) {
  try {
    const claim = await prisma.claim.findUnique({
      where: { id: Number(req.params.id) },
      include: { policy: { include: { customer: true } } },
    });
    if (!claim) return res.status(404).json({ message: "Claim not found" });
    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: "Error fetching claim", error: err.message });
  }
}

async function updateClaimStatus(req, res) {
  try {
    const { status } = req.body;
    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return res.status(400).json({ message: "status must be APPROVED, REJECTED or PENDING" });
    }
    const claim = await prisma.claim.update({
      where: { id: Number(req.params.id) },
      data: { status },
    });
    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: "Error updating claim", error: err.message });
  }
}

module.exports = { submitClaim, getClaims, getClaimById, updateClaimStatus };