const prisma = require("../config/db");

async function getCustomerForUser(userId) {
  return prisma.customer.findUnique({ where: { userId } });
}

// CUSTOMER submits for their own policy; ADMIN/AGENT can submit on behalf of anyone
async function submitClaim(req, res) {
  try {
    const { policyId, claimAmount, reason } = req.body;

    if (req.user.role === "CUSTOMER") {
      const customer = await getCustomerForUser(req.user.id);
      const policy = await prisma.policy.findUnique({ where: { id: Number(policyId) } });
      if (!customer || !policy || policy.customerId !== customer.id) {
        return res.status(403).json({ message: "You can only submit claims for your own policies" });
      }
    }

    const claim = await prisma.claim.create({
      data: { policyId: Number(policyId), claimAmount: Number(claimAmount), reason, status: "PENDING" },
    });
    res.status(201).json(claim);
  } catch (err) {
    res.status(500).json({ message: "Error submitting claim", error: err.message });
  }
}

async function getClaims(req, res) {
  try {
    const { status } = req.query;
    let where = status ? { status } : {};

    if (req.user.role === "CUSTOMER") {
      const customer = await getCustomerForUser(req.user.id);
      if (!customer) return res.json([]);
      where.policy = { customerId: customer.id };
    }

    const claims = await prisma.claim.findMany({
      where,
      include: { policy: { include: { customer: true, plan: true } } },
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
      include: { policy: { include: { customer: true, plan: true } } },
    });
    if (!claim) return res.status(404).json({ message: "Claim not found" });
    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: "Error fetching claim", error: err.message });
  }
}

// ADMIN/AGENT only (route-protected)
async function updateClaimStatus(req, res) {
  try {
    const { status } = req.body;
    if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) {
      return res.status(400).json({ message: "status must be APPROVED, REJECTED or PENDING" });
    }
    const claim = await prisma.claim.update({ where: { id: Number(req.params.id) }, data: { status } });
    res.json(claim);
  } catch (err) {
    res.status(500).json({ message: "Error updating claim", error: err.message });
  }
}

module.exports = { submitClaim, getClaims, getClaimById, updateClaimStatus };